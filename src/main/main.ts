import { app, BrowserWindow, ipcMain } from 'electron'
import { isDev } from './utils'
import path from 'path'
import {
  launchMinecraft,
  getInstances,
  createInstance,
  deleteInstance,
  listVersions,
  installLoader,
  getInstanceById
} from './minecraft'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Handlers for Minecraft operations
ipcMain.handle('minecraft:launch', async (event, instanceId: string) => {
  try {
    await launchMinecraft(instanceId)
    return { success: true, message: 'Minecraft launched successfully' }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('minecraft:getInstances', async () => {
  try {
    const instances = await getInstances()
    return { success: true, instances }
  } catch (error) {
    return { success: false, error: (error as Error).message, instances: [] }
  }
})

ipcMain.handle('minecraft:getInstanceById', async (event, id: string) => {
  try {
    const instance = await getInstanceById(id)
    return { success: true, instance }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('minecraft:createInstance', async (event, config: any) => {
  try {
    const instance = await createInstance(config)
    return { success: true, instance }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('minecraft:deleteInstance', async (event, instanceId: string) => {
  try {
    const success = await deleteInstance(instanceId)
    return { success, message: success ? 'Instance deleted' : 'Failed to delete instance' }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('minecraft:listVersions', async () => {
  try {
    const versions = await listVersions()
    return { success: true, versions }
  } catch (error) {
    return { success: false, error: (error as Error).message, versions: [] }
  }
})

ipcMain.handle('minecraft:installLoader', async (event, instanceId: string, loader: string, version: string) => {
  try {
    const success = await installLoader(instanceId, loader as 'forge' | 'fabric', version)
    return { success, message: success ? `${loader} installed` : `Failed to install ${loader}` }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
