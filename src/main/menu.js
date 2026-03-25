/**
 * menu.js
 * إنشاء شريط القوائم وتوصيل اختصاراته مع Renderer.
 */

const { Menu, shell } = require('electron');

/**
 * إرسال حدث قائمة إلى Renderer.
 * @param {import('electron').BrowserWindow | null} mainWindow
 * @param {string} action
 */
function sendMenuAction(mainWindow, action) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('menu-action', action);
}

/**
 * بناء قائمة التطبيق.
 * @param {import('electron').BrowserWindow} mainWindow
 */
function buildAppMenu(mainWindow) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendMenuAction(mainWindow, 'project:new')
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendMenuAction(mainWindow, 'project:open')
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendMenuAction(mainWindow, 'project:save')
        },
        {
          label: 'Export HTML',
          accelerator: 'CmdOrCtrl+E',
          click: () => sendMenuAction(mainWindow, 'project:export')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: async () => {
            await shell.openExternal('https://github.com/your-username/quiz-builder-pro');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = {
  buildAppMenu
};
