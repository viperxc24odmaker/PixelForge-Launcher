import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Instance {
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

export const useMinecraftStore = defineStore('minecraft', () => {
  const instances = ref<Instance[]>([])
  const versions = ref<VersionInfo[]>([])
  const loading = ref(false)
  const launching = ref(false)
  const error = ref<string | null>(null)
  const selectedInstanceId = ref<string | null>(null)

  const hasInstances = computed(() => instances.value.length > 0)
  const selectedInstance = computed(() =>
    instances.value.find(i => i.id === selectedInstanceId.value)
  )

  async function fetchInstances() {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron?.minecraft.getInstances()
      if (result?.success) {
        instances.value = result.instances
      } else {
        error.value = result?.error || 'Failed to fetch instances'
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchVersions() {
    try {
      const result = await window.electron?.minecraft.listVersions()
      if (result?.success) {
        versions.value = result.versions
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err)
    }
  }

  async function launchInstance(instanceId: string) {
    const instance = instances.value.find(i => i.id === instanceId)
    if (!instance) {
      error.value = 'Instance not found'
      return
    }

    launching.value = true
    error.value = null
    try {
      const result = await window.electron?.minecraft.launch(instanceId)
      if (!result?.success) {
        error.value = result?.error || 'Failed to launch game'
      } else {
        selectedInstanceId.value = instanceId
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      launching.value = false
    }
  }

  async function createNewInstance(config: Omit<Instance, 'id' | 'path' | 'createdAt'>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron?.minecraft.createInstance(config)
      if (result?.success) {
        instances.value.push(result.instance)
      } else {
        error.value = result?.error || 'Failed to create instance'
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function deleteInstanceById(instanceId: string) {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron?.minecraft.deleteInstance(instanceId)
      if (result?.success) {
        instances.value = instances.value.filter(i => i.id !== instanceId)
        if (selectedInstanceId.value === instanceId) {
          selectedInstanceId.value = null
        }
      } else {
        error.value = result?.error || 'Failed to delete instance'
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function installLoaderForInstance(
    instanceId: string,
    loader: 'forge' | 'fabric',
    version: string
  ) {
    loading.value = true
    error.value = null
    try {
      const result = await window.electron?.minecraft.installLoader(instanceId, loader, version)
      if (result?.success) {
        // Refresh instance
        const instance = instances.value.find(i => i.id === instanceId)
        if (instance) {
          instance.loader = loader
        }
      } else {
        error.value = result?.error || 'Failed to install loader'
      }
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    instances,
    versions,
    loading,
    launching,
    error,
    selectedInstanceId,
    hasInstances,
    selectedInstance,
    fetchInstances,
    fetchVersions,
    launchInstance,
    createNewInstance,
    deleteInstanceById,
    installLoaderForInstance,
    clearError
  }
})
