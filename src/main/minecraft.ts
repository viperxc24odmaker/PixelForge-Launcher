import { launch, MinecraftLocation } from '@xmcl/core'
import {
  getVersionList,
  install,
  getForgeVersionList,
  installForge,
  getLoaderArtifactListFor,
  installFabricByLoaderArtifact
} from '@xmcl/installer'
import { readdir, readFile, writeFile, mkdir, rm } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'

const LAUNCHER_DATA = path.join(os.homedir(), '.pixelforge')
const INSTANCES_DIR = path.join(LAUNCHER_DATA, 'instances')

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
  type: string
  releaseTime: string
}

async function ensureDirectories(): Promise<void> {
  if (!existsSync(LAUNCHER_DATA)) await mkdir(LAUNCHER_DATA, { recursive: true })
  if (!existsSync(INSTANCES_DIR)) await mkdir(INSTANCES_DIR, { recursive: true })
}

function detectJava(): string {
  try {
    const result = spawnSync('java', ['-version'], { encoding: 'utf-8' })
    if (result.status === 0 || result.stderr) {
      return 'java'
    }
  } catch {
    // fall through
  }
  return 'java' // fallback, let launch() surface the real error if missing
}

export async function launchMinecraft(instanceId: string): Promise<void> {
  const instance = await getInstanceById(instanceId)
  if (!instance) throw new Error('Instance not found')

  const javaPath = detectJava()
  const gamePath: MinecraftLocation = instance.path

  try {
    const proc = await launch({
      gamePath,
      javaPath,
      version: instance.version,
      minMemory: 1024,
      maxMemory: 4096
    })
    console.log(`Launched Minecraft: PID ${proc.pid}`)
  } catch (error) {
    throw new Error(`Failed to launch: ${(error as Error).message}`)
  }
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
          // Skip folders without a valid instance.json
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

  const modsPath = path.join(instancePath, 'mods')
  const configPath = path.join(instancePath, 'config')

  if (!existsSync(modsPath)) await mkdir(modsPath, { recursive: true })
  if (!existsSync(configPath)) await mkdir(configPath, { recursive: true })

  // Download the Minecraft version into this instance's directory
  try {
    const versionList = await getVersionList()
    const target = versionList.versions.find(v => v.id === config.version)
    if (target) {
      await install(target, instancePath)
    } else {
      console.warn(`Version ${config.version} not found in version manifest`)
    }
  } catch (error) {
    console.warn(`Version installation skipped: ${(error as Error).message}`)
  }

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

  // Install loader on top of vanilla, if requested
  if (config.loader === 'forge' || config.loader === 'fabric') {
    try {
      await installLoader(instanceId, config.loader, config.version)
    } catch (error) {
      console.warn(`Loader installation skipped: ${(error as Error).message}`)
    }
  }

  return instance
}

export async function deleteInstance(id: string): Promise<boolean> {
  try {
    const instance = await getInstanceById(id)
    if (!instance) return false

    await rm(instance.path, { recursive: true, force: true })
    return true
  } catch (error) {
    console.error('Failed to delete instance:', error)
    return false
  }
}

export async function listVersions(): Promise<VersionInfo[]> {
  try {
    const versionList = await getVersionList()
    return versionList.versions
      .filter(v => v.type === 'release')
      .slice(0, 50)
      .map(v => ({
        id: v.id,
        type: v.type,
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
  mcVersion: string
): Promise<boolean> {
  const instance = await getInstanceById(instanceId)
  if (!instance) return false

  try {
    if (loader === 'forge') {
      const forgeVersions = await getForgeVersionList()
      const match = forgeVersions.versions.find(v => v.mcversion === mcVersion)
      if (!match) {
        console.warn(`No Forge version found for Minecraft ${mcVersion}`)
        return false
      }
      await installForge(match, instance.path)
    } else if (loader === 'fabric') {
      const fabricVersions = await getLoaderArtifactListFor(mcVersion, {})
      const match = fabricVersions[0] // latest loader build for this Minecraft version
      if (!match) {
        console.warn(`No Fabric loader versions found for Minecraft ${mcVersion}`)
        return false
      }
      await installFabricByLoaderArtifact(match, instance.path)
    }
    return true
  } catch (error) {
    console.error(`Failed to install ${loader}:`, error)
    return false
  }
}
