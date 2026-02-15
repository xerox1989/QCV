
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose specific capabilities to the renderer
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  quitApp: () => ipcRenderer.send('app-quit'),
  // We can add native file system access or other OS integrations here later
  platform: process.platform
});
