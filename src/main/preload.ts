import { contextBridge, ipcRenderer } from 'electron'

const api = {
  minecraft: {
    launch: (instanceId: string) => ipcRenderer.invoke('minecraft:launch', instanceId),
    getInstances: () => ipcRenderer.invoke('minecraft:getInstances'),
    getInstanceById: (id: string) => ipcRenderer.invoke('minecraft:getInstanceById', id),
    createInstance: (config: any) => ipcRenderer.invoke('minecraft:createInstance', config),
    deleteInstance: (instanceId: string) => ipcRenderer.invoke('minecraft:deleteInstance', instanceId),
    listVersions: () => ipcRenderer.invoke('minecraft:listVersions'),
    installLoader: (instanceId: string, loader: string, version: string) =>
      ipcRenderer.invoke('minecraft:installLoader', instanceId, loader, version)
  },
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo')
  }
}

contextBridge.exposeInMainWorld('electron', api)

declare global {
  interface Window {
    electron: typeof api
  }
}
