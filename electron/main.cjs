const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater logging and basic behavior
autoUpdater.logger = console;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('[Electron Update] Checking for update...');
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { type: 'checking' });
  }
});
autoUpdater.on('update-available', (info) => {
  console.log('[Electron Update] Update available. Downloading in background...', info);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { type: 'available', version: info.version });
  }
});
autoUpdater.on('update-not-available', (info) => {
  console.log('[Electron Update] Update not available.', info);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { type: 'not-available' });
  }
});
autoUpdater.on('error', (err) => {
  console.error('[Electron Update] Error in auto-updater:', err);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { type: 'error', message: err.message });
  }
});
autoUpdater.on('download-progress', (progressObj) => {
  console.log(`[Electron Update] Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { 
      type: 'progress', 
      percent: Math.round(progressObj.percent),
      speed: progressObj.bytesPerSecond
    });
  }
});
autoUpdater.on('update-downloaded', (info) => {
  console.log('[Electron Update] Update downloaded; will be installed on app quit.', info);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { type: 'downloaded', version: info.version });
  }
});

// IPC handler to relaunch app after update is downloaded
ipcMain.on('relaunch-app', () => {
  console.log('[Electron Update] Relaunching app to apply downloaded update...');
  try {
    autoUpdater.quitAndInstall();
  } catch (err) {
    console.error('[Electron Update] quitAndInstall failed, attempting fallback relaunch:', err);
    try {
      app.relaunch();
      app.exit(0);
    } catch (fallbackErr) {
      console.error('[Electron Update] Fallback relaunch failed:', fallbackErr);
    }
  }
});

let mainWindow;
let splashWindow;
let serverProcess;

function startBackendServer() {
  const serverPath = path.join(__dirname, '..', 'dist', 'server.cjs');
  console.log(`[Electron] Spawning backend server process: ${serverPath}`);
  
  // Set NODE_ENV to production inside the compiled app
  serverProcess = fork(serverPath, [], {
    cwd: app.getPath('userData'),
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      PORT: '3000' 
    },
    silent: false
  });

  serverProcess.on('error', (err) => {
    console.error('[Electron] Backend server process error:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[Electron] Backend server process exited with code ${code} and signal ${signal}`);
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html')).catch((err) => {
    console.error('[Electron] Failed to load splash screen:', err);
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'ShopMaster - WhatsApp POS Sync',
    icon: path.join(__dirname, '..', 'public', 'logo.svg'),
    show: false, // Main window loaded hidden, shown once splash completes
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Hide default menu bar for a clean, app-like experience
  mainWindow.removeMenu();

  // Load local express server
  const startUrl = 'http://localhost:3000';
  
  mainWindow.loadURL(startUrl).catch((err) => {
    console.warn('[Electron] Initial connection failed, retrying in 1.5 seconds...', err.message);
    setTimeout(() => {
      mainWindow.loadURL(startUrl).catch(finalErr => {
        console.error('[Electron] Failed to load local server:', finalErr);
      });
    }, 1500);
  });

  // Close splash screen and reveal main window after 3.2 seconds
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
    }
    if (mainWindow) {
      mainWindow.show();
    }
  }, 3200);

  // Intercept links and open them in the user's default external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Firebase Auth popups to open as native child windows inside the app
    if (url.includes('firebaseapp.com') && url.includes('/__/auth/')) {
      return { 
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 650,
          title: 'Google Sign-In - ShopMaster',
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        }
      };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Enable Single Instance Lock to prevent multiple apps running concurrently
const additionalData = { myKey: 'shopmaster-lock' };
const gotTheLock = app.requestSingleInstanceLock(additionalData);

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    // Focus the existing window if user attempts to launch a second one
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Start local server and then create the Electron windows
    startBackendServer();
    createSplashWindow();
    createWindow();

    // Check for updates shortly after startup
    setTimeout(() => {
      console.log('[Electron Update] Checking for updates...');
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        console.error('[Electron Update] Error checking for updates:', err);
      });
    }, 5000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}


// Terminate backend process gracefully when the app exits
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanupAndQuit();
  }
});

app.on('will-quit', () => {
  cleanupAndQuit();
});

function cleanupAndQuit() {
  if (serverProcess) {
    console.log('[Electron] Terminating backend server process...');
    serverProcess.kill('SIGINT');
    serverProcess = null;
  }
  app.quit();
}
