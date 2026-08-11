import { app, BrowserWindow, ipcMain, Menu, session } from 'electron'
import { isDev } from './utils'
import path from 'path'
import os from 'os'
import { spawnSync } from 'child_process'
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
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  // Keep PixelForge looking like a standalone desktop app instead of
  // exposing Electron's default File/Edit/View/Window/Help menu.
  mainWindow.setMenuBarVisibility(false)
  Menu.setApplicationMenu(null)

  // Don't allow the renderer to navigate away from the launcher UI.
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })

  // Open external links in the user's normal browser rather than inside Electron.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      void session.defaultSession.loadExtension?.('')
    }
    return { action: 'deny' }
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`

  mainWindow.loadURL(startUrl)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
})

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

// System info handler (safe place for Node 'os' module access)
ipcMain.handle('system:getInfo', async () => {
  try {
    const totalRamGB = (os.totalmem() / 1024 ** 3).toFixed(1)

    let javaVersion = 'Not detected'
    try {
      const result = spawnSync('java', ['-version'], { encoding: 'utf-8' })
      const output = result.stderr || result.stdout || ''
      const match = output.match(/version \"(.+?)\"/)
      javaVersion = match ? match[1] : 'Detected (version unknown)'
    } catch {
      javaVersion = 'Not detected'
    }

    return {
      success: true,
      totalRamGB,
      javaVersion,
      platform: process.platform,
      arch: process.arch
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
