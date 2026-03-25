/**
 * ipc-handlers.js
 * يحتوي على جميع معالجات IPC الخاصة بالملفات والوسائط والمعاينة.
 */

const path = require('node:path');
const fs = require('node:fs/promises');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

/**
 * تحويل مسار ملف إلى Data URL بصيغة Base64.
 * @param {string} filePath
 * @returns {Promise<{name: string, ext: string, mimeType: string, dataUrl: string, size: number}>}
 */
async function fileToDataUrl(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_MAP[ext] || 'application/octet-stream';

  return {
    name: path.basename(filePath),
    ext,
    mimeType,
    size: buffer.length,
    dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`
  };
}

/**
 * حفظ ملف نصي بعد اختيار المسار من المستخدم.
 * @param {{title: string, defaultPath: string, filters: {name: string, extensions: string[]}[], content: string}} payload
 * @returns {Promise<{success: boolean, canceled?: boolean, filePath?: string, error?: string}>}
 */
async function saveTextFile(payload) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: payload.title,
    defaultPath: payload.defaultPath,
    filters: payload.filters
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  await fs.writeFile(filePath, payload.content, 'utf8');
  return { success: true, filePath };
}

/**
 * إنشاء نافذة معاينة مستقلة لعرض HTML الناتج.
 * @param {string} htmlContent
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function openPreviewWindow(htmlContent) {
  const tempFilePath = path.join(app.getPath('temp'), 'quiz-builder-pro-preview.html');
  await fs.writeFile(tempFilePath, htmlContent, 'utf8');

  const previewWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    autoHideMenuBar: true,
    backgroundColor: '#0b1220',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  await previewWindow.loadFile(tempFilePath);
  return { success: true };
}

/**
 * تحميل الأصوات الافتراضية من مجلد assets/sounds وتحويلها إلى Base64.
 * @returns {Promise<Record<string, string>>}
 */
async function loadDefaultSounds() {
  const soundsDir = path.join(__dirname, '..', '..', 'assets', 'sounds');
  const soundFiles = ['correct.mp3', 'incorrect.mp3', 'tick.mp3', 'complete.mp3'];
  const result = {};

  await Promise.all(
    soundFiles.map(async (fileName) => {
      const fullPath = path.join(soundsDir, fileName);
      try {
        const metadata = await fileToDataUrl(fullPath);
        result[path.parse(fileName).name] = metadata.dataUrl;
      } catch {
        result[path.parse(fileName).name] = '';
      }
    })
  );

  return result;
}

/**
 * تسجيل جميع IPC handlers مرة واحدة.
 */
function registerIpcHandlers() {
  ipcMain.handle('save-html', async (_event, payload) => {
    try {
      return await saveTextFile({
        title: 'Export Quiz as HTML',
        defaultPath: payload?.defaultPath || 'quiz-export.html',
        filters: [{ name: 'HTML Files', extensions: ['html'] }],
        content: payload?.content || ''
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('save-project', async (_event, payload) => {
    try {
      const projectJson = JSON.stringify(payload?.data || {}, null, 2);
      return await saveTextFile({
        title: 'Save Quiz Project',
        defaultPath: payload?.defaultPath || 'quiz-project.quizpro',
        filters: [{ name: 'QuizPro Project', extensions: ['quizpro', 'json'] }],
        content: projectJson
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('open-project', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Open Quiz Project',
        properties: ['openFile'],
        filters: [{ name: 'QuizPro Project', extensions: ['quizpro', 'json'] }]
      });

      if (canceled || !filePaths.length) {
        return { success: false, canceled: true };
      }

      const selectedPath = filePaths[0];
      const content = await fs.readFile(selectedPath, 'utf8');
      return {
        success: true,
        filePath: selectedPath,
        data: JSON.parse(content)
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('select-image', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Image',
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
      });

      if (canceled || !filePaths.length) {
        return { success: false, canceled: true };
      }

      const data = await fileToDataUrl(filePaths[0]);
      return { success: true, filePath: filePaths[0], data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('select-audio', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Audio',
        properties: ['openFile'],
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }]
      });

      if (canceled || !filePaths.length) {
        return { success: false, canceled: true };
      }

      const data = await fileToDataUrl(filePaths[0]);
      return { success: true, filePath: filePaths[0], data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('preview-quiz', async (_event, payload) => {
    try {
      return await openPreviewWindow(payload?.content || '');
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('get-sounds', async () => {
    try {
      const sounds = await loadDefaultSounds();
      return { success: true, sounds };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}

module.exports = {
  registerIpcHandlers
};
