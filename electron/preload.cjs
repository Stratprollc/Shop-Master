const { contextBridge, ipcRenderer } = require('electron');

// Preload script for secure main process communications
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Electron Preload] Sandbox initialized successfully.');
});

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  onUpdateStatus: (callback) => {
    const listener = (event, status) => callback(status);
    ipcRenderer.on('update-status', listener);
    return () => ipcRenderer.removeListener('update-status', listener);
  },
  relaunchApp: () => {
    ipcRenderer.send('relaunch-app');
  }
});
