export {}

declare global {
  interface Window {
    electron: {
      minecraft: {
        launch: (instanceId: string) => Promise<any>
        getInstances: () => Promise<any>
        getInstanceById: (id: string) => Promise<any>
        createInstance: (config: any) => Promise<any>
        deleteInstance: (instanceId: string) => Promise<any>
        listVersions: () => Promise<any>
        installLoader: (instanceId: string, loader: string, version: string) => Promise<any>
      }
      system: {
        getInfo: () => Promise<any>
      }
    }
  }
}
