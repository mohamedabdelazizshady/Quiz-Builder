/**
 * main.js
 * نقطة دخول Electron Main Process: إنشاء النافذة الرئيسية، تهيئة القوائم، وربط IPC.
 */

const path = require('node:path');
const { app, BrowserWindow } = require('electron');
const { registerIpcHandlers } = require('./ipc-handlers');
const { buildAppMenu } = require('./menu');

let mainWindow = null;

/**
 * إنشاء نافذة التطبيق الأساسية مع إعدادات أمان مناسبة.
 * @returns {BrowserWindow}
 */
function createMainWindow() {
  const windowInstance = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  windowInstance.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  windowInstance.once('ready-to-show', () => {
    windowInstance.show();
  });

  windowInstance.on('closed', () => {
    if (mainWindow === windowInstance) {
      mainWindow = null;
    }
  });

  if (process.env.NODE_ENV === 'development') {
    windowInstance.webContents.openDevTools({ mode: 'detach' });
  }

  return windowInstance;
}

/**
 * تهيئة التطبيق بعد جاهزية Electron.
 */
async function bootstrap() {
  registerIpcHandlers();
  mainWindow = createMainWindow();
  buildAppMenu(mainWindow);
}

app.whenReady().then(bootstrap).catch((error) => {
  console.error('[main] Failed to bootstrap app:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
    buildAppMenu(mainWindow);
  }
});
