// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, globalShortcut, ipcMain, Notification, Tray, Menu } = require('electron')
const Positioner = require('electron-positioner');
const path = require('path');
let tray;

app.setAppUserModelId('Clipboard Manager');

const createWindow = () => {
    const { width } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        width: width,
        height: 350,
        resizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        show: false,
        icon: 'paste.ico',
        transparent: true,
        backgroundMaterial: 'mica',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false
    });

    const positioner = new Positioner(mainWindow);
    positioner.move('bottomCenter');

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.show();
    });

    mainWindow.on('blur', function () {
        mainWindow.hide();
    })

    mainWindow.webContents.on('before-input-event', function (_, input) {
        if (input.key === 'Escape') {
            mainWindow.hide();
        }
    });

    // Listen for the custom-event from the renderer process
    ipcMain.on('copied-to-clipboard', function (_, message) {
        mainWindow.hide();
        const notification = new Notification({
            title: 'Clipboard Updated',
            body: `An item has been added to the clipboard: ${message}`,
            icon: 'paste.ico'
        });

        notification.show();
    });

    // Show the window when the tray icon is double-clicked
    tray.on('double-click', function () {
        mainWindow.show();
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

}

function createTray() {
    tray = new Tray(path.join(__dirname, 'paste.ico'));

    // Create a context menu for the tray icon
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: function () {
                app.quit();
            },
        },
    ]);

    // Set the context menu for the tray icon
    tray.setContextMenu(contextMenu);
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
    .then(() => {
        globalShortcut.register('Control+Shift+C', () => {
            BrowserWindow.getAllWindows().forEach(win => {
                win.show();
            });
        })
    })
    .then(() => {
        createTray();
        createWindow();

        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
