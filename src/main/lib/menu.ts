import { app, ipcMain, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, remote } from "electron";
import { DiagramType, FileFormat, ISaveIpcOptions } from '../../common/types';
import { createMainWindow } from './mainWindow';

const isMac = process.platform === 'darwin';

const handleNewWithExample = (type?: DiagramType) => {
  createMainWindow({ useExample: type });
}

const openedFileMap = new Map<string, number>();
ipcMain.on('file-opened', async (e, filePath: string) => {
  const win = BrowserWindow.getFocusedWindow();
  if (filePath && win && win.id) {
    openedFileMap.set(filePath, win.id);
  }
});

ipcMain.on('file-closed', async (e, filePath: string) => {
  openedFileMap.delete(filePath);
});

const handleOpenFile = async () => {
  const { filePaths } = await dialog.showOpenDialog(null, {
    filters: [
      {
        name: FileFormat.MERM,
        extensions: [ FileFormat.MERM ],
      }
    ]
  });

  filePaths.forEach((filePath: string) => {
    const winId = openedFileMap.get(filePath);
    if (winId) {
      const win = BrowserWindow.fromId(winId);
      if (win) {
        win.moveTop();
      } else {
        openedFileMap.delete(filePath);
        createMainWindow({ filePath });  
      }
    } else {
      createMainWindow({ filePath });
    }
  });
};

const handleSaveFile = (format?: FileFormat) => {
  const win = BrowserWindow.getFocusedWindow();
  const opts: ISaveIpcOptions = { format };
  win.webContents.send('save-diagram', opts);
};

const fileMenuTpl = {
  label: 'File',
  submenu: [
    {
      label: 'New With Example',
      submenu: [
        {
          label: 'Flowchart',
          click: () => handleNewWithExample(DiagramType.FLOWCHART),
        },
        {
          label: 'Sequence Diagram',
          click: () => handleNewWithExample(DiagramType.SEQUENCE),
        },
        {
          label: 'Class Diagram',
          click: () => handleNewWithExample(DiagramType.CLASS),
        },
        {
          label: 'State Diagram',
          click: () => handleNewWithExample(DiagramType.STATE),
        },
        {
          label: 'Gantt',
          click: () => handleNewWithExample(DiagramType.GANTT),
        },
        {
          label: 'Pie Chart',
          click: () => handleNewWithExample(DiagramType.PIE),
        },
      ] as MenuItemConstructorOptions[],
    },
    {
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click: handleOpenFile,
    },
    { type: 'separator' },
    {
      label: 'Save...',
      accelerator: 'CmdOrCtrl+S',
      click: () => handleSaveFile(FileFormat.MERM),
    },
    {
      label: 'Export to',
      submenu: [
        {
          label: 'PNG',
          click: () => handleSaveFile(FileFormat.PNG),
        },
        {
          label: 'JPG',
          click: () => handleSaveFile(FileFormat.JPG),
        },
        {
          label: 'SVG',
          click: () => handleSaveFile(FileFormat.SVG),
        },
      ] as MenuItemConstructorOptions[],
    },
    { type: 'separator' },
    isMac ? { role: 'close' } : { role: 'quit' }
  ] as MenuItemConstructorOptions[],
};

let menuTpl: MenuItemConstructorOptions[] = [];

if (isMac) {
  menuTpl = [
    ...menuTpl,
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ] as MenuItemConstructorOptions[]
    }
  ];
}

menuTpl = [
  ...menuTpl,
  fileMenuTpl,
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ] as MenuItemConstructorOptions[]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ] as MenuItemConstructorOptions[]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://github.com/xyeric/koala-diagram/tree/master/docs');
        }
      }
    ] as MenuItemConstructorOptions[]
  }
];

export function createMenu() {
  return Menu.buildFromTemplate(menuTpl);
}

export default { createMenu };