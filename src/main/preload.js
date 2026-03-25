/**
 * preload.js
 * جسر آمن بين Renderer و Main باستخدام contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * الاشتراك في أحداث القائمة القادمة من Main Process.
 * @param {(action: string) => void} callback
 * @returns {() => void}
 */
function onMenuAction(callback) {
  const listener = (_event, action) => callback(action);
  ipcRenderer.on('menu-action', listener);
  return () => ipcRenderer.removeListener('menu-action', listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveHtml: (payload) => ipcRenderer.invoke('save-html', payload),
  saveProject: (payload) => ipcRenderer.invoke('save-project', payload),
  openProject: () => ipcRenderer.invoke('open-project'),
  selectImage: () => ipcRenderer.invoke('select-image'),
  selectAudio: () => ipcRenderer.invoke('select-audio'),
  previewQuiz: (payload) => ipcRenderer.invoke('preview-quiz', payload),
  getSounds: () => ipcRenderer.invoke('get-sounds'),
  onMenuAction
});
