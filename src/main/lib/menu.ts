import { app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from "electron";
import { DiagramType, FileFormat, IInitIpcOptions, ISaveIpcOptions } from '../../common/types';
import { createWindow } from './mainWindow';

const isMac = process.platform === 'darwin';

const handleNewWithExample = (type?: DiagramType) => {
  const win = createWindow();
  win.webContents.on('dom-ready', () => {
    const opts: IInitIpcOptions = { type };
    win.webContents.send('init-with-example', opts);
  });
}

const handleOpenDiagram = async () => {
  const { filePaths } = await dialog.showOpenDialog(null, {
    filters: [
      {
        name: FileFormat.MERM,
        extensions: [ FileFormat.MERM ],
      }
    ]
  });

  filePaths.forEach((filePath: string) => {
    const win = createWindow();
    win.webContents.on('dom-ready', () => {
      win.webContents.send('open-file', { filePath });
    });
  });
};

const handleSaveDiagram = (format?: FileFormat) => {
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
      click: handleOpenDiagram,
    },
    { type: 'separator' },
    {
      label: 'Save...',
      click: () => handleSaveDiagram(FileFormat.MERM),
    },
    {
      label: 'Export to',
      submenu: [
        {
          label: 'PNG',
          click: () => handleSaveDiagram(FileFormat.PNG),
        },
        {
          label: 'JPG',
          click: () => handleSaveDiagram(FileFormat.JPG),
        },
        {
          label: 'SVG',
          click: () => handleSaveDiagram(FileFormat.SVG),
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