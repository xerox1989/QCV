// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Whitelisted IPC channels
const whitelistedChannels = ['sendMessage', 'receiveMessage'];

contextBridge.exposeInMainWorld('api', {
    // Limited API methods
    sendMessage: (data) => {
        ipcRenderer.send('sendMessage', data);
    },
    receiveMessage: (callback) => {
        ipcRenderer.on('receiveMessage', (event, ...args) => callback(...args));
    },
});

// Navigation prevention
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});