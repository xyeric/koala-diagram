import path from 'path';
import queryString from 'query-string';
import { BrowserWindow } from 'electron';
import { IWindowUrlParams } from '../../common/types';
import { createTouchBar } from './touchBar';

const isDev = process.env.NODE_ENV === 'development';

const winURL = isDev ? `http://localhost:9080` : `file://${__dirname}/index.html`;

export function createMainWindow(params?: IWindowUrlParams) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1080,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './preload.js'),
    },
    show: false,
  });

  win.setTouchBar(createTouchBar());

  // and load the index.html of the app.
  win.loadURL(`${winURL}?${queryString.stringify(params || {})}`);

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }

  win.on('ready-to-show', () => {
    win.show();
    win.setVibrancy('tooltip')
  });

  return win;
}
