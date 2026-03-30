// Updated Electron settings for security hardening
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true
    }
  });

  win.loadURL('https://your-secure-url.com');
}

app.whenReady().then(createWindow);
