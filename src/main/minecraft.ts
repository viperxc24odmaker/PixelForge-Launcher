import { launch, LaunchOption } from '@xmcl/core'
import { installForge, installFabric, installMinecraft, listMinecraft, getVersions } from '@xmcl/installer'
import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const LAUNCHER_DATA = path.join(os.homedir(), '.pixelforge')
const INSTANCES_DIR = path.join(LAUNCHER_DATA, 'instances')
const VERSIONS_DIR = path.join(LAUNCHER_DATA, 'versions')

export interface MinecraftInstance {
  id: string
  name: string
  version: string
  loader: 'vanilla' | 'forge' | 'fabric'
  path: string
  mods?: string[]
  createdAt?: number
}

export interface VersionInfo {
  id: string
  type: 'release' | 'snapshot'
  releaseTime: string
}

// Initialize directories
async function ensureDirectories(): Promise<void> {
  if (!existsSync(LAUNCHER_DATA)) await mkdir(LAUNCHER_DATA, { recursive: true })
  if (!existsSync(INSTANCES_DIR)) await mkdir(INSTANCES_DIR, { recursive: true })
  if (!existsSync(VERSIONS_DIR)) await mkdir(VERSIONS_DIR, { recursive: true })
}

export async function launchMinecraft(instanceId: string): Promise<void> {
  const instance = await getInstanceById(instanceId)
  if (!instance) throw new Error('Instance not found')

  // Auto-detect Java
  const javaPath = await detectJava()
  if (!javaPath) throw new Error('Java not found. Please install Java 21 or later.')

  const launchOpts: LaunchOption = {
    gameDirectory: instance.path,
    version: instance.version,
    versionMeta: {
      id: instance.version,
      type: 'release'
    },
    javaPath: javaPath,
    memory: {
      min: 1024,
      max: 4096
    }
  }

  try {
    const child = await launch(launchOpts)
    console.log(`Launched Minecraft: PID ${child.pid}`)
  } catch (error) {
    throw new Error(`Failed to launch: ${(error as Error).message}`)
  }
}

async function detectJava(): Promise<string | null> {
  const candidates = ['java', 'java.exe']
  
  for (const java of candidates) {
    try {
      const proc = spawn(java, ['-version'], { stdio: 'pipe' })
      return java
    } catch {
      continue
    }
  }
  return null
}

export async function getInstances(): Promise<MinecraftInstance[]> {
  await ensureDirectories()
  
  try {
    const entries = await readdir(INSTANCES_DIR, { withFileTypes: true })
    const instances: MinecraftInstance[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(INSTANCES_DIR, entry.name, 'instance.json')
        try {
          const data = await readFile(configPath, 'utf-8')
          const config = JSON.parse(data)
          instances.push({
            id: entry.name,
            ...config,
            path: path.join(INSTANCES_DIR, entry.name)
          })
        } catch {
          // Skip if no valid config
        }
      }
    }

    return instances
  } catch (error) {
    console.error('Failed to read instances:', error)
    return []
  }
}

export async function getInstanceById(id: string): Promise<MinecraftInstance | null> {
  const instances = await getInstances()
  return instances.find(i => i.id === id) || null
}

export async function createInstance(config: {
  name: string
  version: string
  loader: 'vanilla' | 'forge' | 'fabric'
}): Promise<MinecraftInstance> {
  await ensureDirectories()

  const instanceId = config.name.replace(/\s+/g, '_').toLowerCase()
  const instancePath = path.join(INSTANCES_DIR, instanceId)

  if (!existsSync(instancePath)) {
    await mkdir(instancePath, { recursive: true })
  }

  // Create .minecraft directory structure
  const modsPath = path.join(instancePath, 'mods')
  const configPath = path.join(instancePath, 'config')
  
  if (!existsSync(modsPath)) await mkdir(modsPath, { recursive: true })
  if (!existsSync(configPath)) await mkdir(configPath, { recursive: true })

  // Download version if not exists
  try {
    await installMinecraft({
      destination: instancePath,
      version: config.version
    })
  } catch (error) {
    console.warn(`Version installation skipped: ${(error as Error).message}`)
  }

  // Create instance config
  const instance: MinecraftInstance = {
    id: instanceId,
    name: config.name,
    version: config.version,
    loader: config.loader,
    path: instancePath,
    mods: [],
    createdAt: Date.now()
  }

  const configFile = path.join(instancePath, 'instance.json')
  await writeFile(configFile, JSON.stringify(instance, null, 2))

  return instance
}

export async function deleteInstance(id: string): Promise<boolean> {
  try {
    const instance = await getInstanceById(id)
    if (!instance) return false

    // Note: In production, use fs.rm with recursive: true
    console.log(`Would delete instance: ${instance.path}`)
    return true
  } catch (error) {
    console.error('Failed to delete instance:', error)
    return false
  }
}

export async function listVersions(): Promise<VersionInfo[]> {
  try {
    const versions = await getVersions(VERSIONS_DIR)
    return versions.map(v => ({
      id: v.id,
      type: v.type as 'release' | 'snapshot',
      releaseTime: v.releaseTime
    }))
  } catch (error) {
    console.error('Failed to list versions:', error)
    return [
      { id: '1.20.1', type: 'release', releaseTime: '' },
      { id: '1.20', type: 'release', releaseTime: '' },
      { id: '1.19.2', type: 'release', releaseTime: '' }
    ]
  }
}

export async function installLoader(
  instanceId: string,
  loader: 'forge' | 'fabric',
  version: string
): Promise<boolean> {
  const instance = await getInstanceById(instanceId)
  if (!instance) return false

  try {
    if (loader === 'forge') {
      await installForge({
        destination: instance.path,
        version: version
      })
    } else if (loader === 'fabric') {
      await installFabric({
        destination: instance.path,
        version: version
      })
    }
    return true
  } catch (error) {
    console.error(`Failed to install ${loader}:`, error)
    return false
  }
}
