const path = require('path');
const { app, BrowserWindow } = require('electron');

const isDev = process.env.NODE_ENV === 'development';

process.env.RUTALLER_DB_PATH = isDev
  ? path.join(__dirname, '..', 'database', 'rutaller.sqlite')
  : path.join(app.getPath('userData'), 'rutaller.sqlite');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'rutaller_dev_secret_change_me';

let mainWindow;

async function createWindow() {
  const { startServer } = require('../backend/src/server');
  await startServer(4000);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
