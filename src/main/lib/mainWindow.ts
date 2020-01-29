import { BrowserWindow } from "electron";
import { createTouchBar } from './touchBar';

let mainWindow: Electron.BrowserWindow;

const isDev = process.env.NODE_ENV === 'development';

const winURL = isDev ? `http://localhost:9080` : `file://${__dirname}/index.html`;

export function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 768,
    title: 'Koala',
    webPreferences: {
      nodeIntegration: true

      // preload: path.join(__dirname, "preload.js"),
    },
    width: 1080,
  });

  mainWindow.setTouchBar(createTouchBar())

  // and load the index.html of the app.
  mainWindow.loadURL(winURL);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}
