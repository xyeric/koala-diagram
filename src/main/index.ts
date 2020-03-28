import { app, dialog, protocol, BrowserWindow, Menu } from "electron";
import { createMainWindow } from './lib/mainWindow';
import { createMenu } from './lib/menu';
const path = require('path')

app.on('ready', () => {
  // protocol.registerFileProtocol('koala-diagram', (request, callback) => {
  //   const url = request.url.substr(7)
  //   callback({ path: path.normalize(`${__dirname}/${url}`) })
  // }, (error) => {
  //   if (error) console.error('Failed to register protocol')
  // })
})

const isDev = process.env.NODE_ENV === 'development';

// ensure single app instance
ensureSingleInstance();

// initialize app instance
initialize();

export function initialize() {
  bindEvents();
  Menu.setApplicationMenu(createMenu());
}

function bindEvents() {
  app.on("ready", () => {
    if (tryMoveToApplicationFolder()) {
      return;
    }

    createMainWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

function ensureSingleInstance() {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      const allWindows = BrowserWindow.getAllWindows();
      if (allWindows.length === 0) {
        createMainWindow();
      } else {
        allWindows.forEach(win => {
          if (win.isMinimized()) win.restore();
        });
        allWindows[0].focus();
      }
    });
  }
}

function tryMoveToApplicationFolder() {
  if (isDev || app.isInApplicationsFolder()) {
    return false;
  }

  const index = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Move to Applications', 'Not Now'],
    defaultId: 0,
    message: 'Koala Diagram works best when it is in your Applications folder. Would you like to move it now?',
  });

  if (index !== 0) {
    return false;
  }

  return app.moveToApplicationsFolder({
    conflictHandler: (conflictType) => {
      if (conflictType === 'exists') {
        return dialog.showMessageBoxSync({
          type: 'question',
          buttons: ['Halt Move', 'Continue Move'],
          defaultId: 0,
          message: 'An app of this name already exists.'
        }) === 1;
      }

      if (conflictType === 'existsAndRunning') {
        dialog.showMessageBoxSync({
          type: 'question',
          defaultId: 0,
          message: 'An app of this name already exists and running, please exit it and try again.',
        });
        return false;
      }
    }
  });
}
