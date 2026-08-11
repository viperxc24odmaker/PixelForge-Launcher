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
  return 'java'
}

async function resolveLaunchVersion(instance: MinecraftInstance): Promise<string> {
  const versionsDir = path.join(instance.path, 'versions')
  const exactDir = path.join(versionsDir, instance.version)
  const exactJson = path.join(exactDir, `${instance.version}.json`)

  if (existsSync(exactJson)) {
    return instance.version
  }

  if (!existsSync(versionsDir)) {
    throw new Error(`Minecraft is not installed for this instance. Expected: ${versionsDir}`)
  }

  const entries = await readdir(versionsDir, { withFileTypes: true })
  const candidates: string[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const id = entry.name
    if (id === instance.version) continue

    const jsonPath = path.join(versionsDir, id, `${id}.json`)
    if (!existsSync(jsonPath)) continue

    try {
      const metadata = JSON.parse(await readFile(jsonPath, 'utf-8'))
      const inheritsFrom = metadata?.inheritsFrom
      const hasBaseVersion = inheritsFrom === instance.version || id.includes(instance.version)
      const hasLoader = instance.loader === 'forge'
        ? /forge/i.test(id)
        : instance.loader === 'fabric'
          ? /fabric/i.test(id)
          : false

      if (hasBaseVersion && hasLoader) {
        candidates.push(id)
      }
    } catch {
      // Ignore malformed version profiles.
    }
  }

  if (candidates.length > 0) {
    candidates.sort()
    return candidates[candidates.length - 1]
  }

  throw new Error(
    `No installed ${instance.loader} profile was found for Minecraft ${instance.version}. ` +
    'Reinstall the instance/loader before launching.'
  )
}

export async function launchMinecraft(instanceId: string): Promise<void> {
  const instance = await getInstanceById(instanceId)
  if (!instance) throw new Error('Instance not found')

  const javaPath = detectJava()
  const gamePath: MinecraftLocation = instance.path
  const launchVersion = await resolveLaunchVersion(instance)

  try {
    const proc = await launch({
      gamePath,
      javaPath,
      version: launchVersion,
      minMemory: 1024,
      maxMemory: 4096,
      extraExecOption: { detached: true }
    })
    console.log(`Launched Minecraft ${launchVersion}: PID ${proc.pid}`)
  } catch (error) {
    throw new Error(`Failed to launch Minecraft ${launchVersion}: ${(error as Error).message}`)
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

  try {
    const versionList = await getVersionList()
    const target = versionList.versions.find(v => v.id === config.version)
    if (target) {
      await install(target, instancePath)
    } else {
      throw new Error(`Version ${config.version} not found in version manifest`)
    }
  } catch (error) {
    throw new Error(`Failed to install Minecraft ${config.version}: ${(error as Error).message}`)
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

  if (config.loader === 'forge' || config.loader === 'fabric') {
    const installed = await installLoader(instanceId, config.loader, config.version)
    if (!installed) {
      throw new Error(`Failed to install ${config.loader} for Minecraft ${config.version}`)
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
      const match = fabricVersions[0]
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
