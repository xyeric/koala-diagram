import { app, Menu, MenuItemConstructorOptions } from "electron";
import { Context } from './context';

const isMac = process.platform === 'darwin';

function getFileMenuTpl(ctx: Context) {
  const handleSaveAs = (format?: 'merd' | 'png' | 'jpg' | 'svg') => {
    ctx.mainWindow.webContents.send('save-as-png', { format });
  };

  const template = {
    label: 'File',
    submenu: [
      {
        label: 'New With Example',
      },
      {
        label: 'Open...',
        click: handleSaveAs,
      },
      { type: 'separator' },
      {
        label: 'Save...',
        click: () => handleSaveAs('merd'),
      },
      {
        label: 'Export to',
        submenu: [
          {
            label: 'PNG',
            click: () => handleSaveAs('png'),
          },
          {
            label: 'JPG',
            click: () => handleSaveAs('jpg'),
          },
          {
            label: 'SVG',
            click: () => handleSaveAs('svg'),
          },
        ] as MenuItemConstructorOptions[],
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ] as MenuItemConstructorOptions[],
  };

  return template;
}

function getMenuTpl(ctx: Context):  MenuItemConstructorOptions[] {
  let tpl: MenuItemConstructorOptions[] = [];

  if (isMac) {
    tpl = [
      ...tpl,
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
  
  tpl = [
    ...tpl,
    getFileMenuTpl(ctx),
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
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/xyeric/koala-diagram/README.md')
          }
        }
      ] as MenuItemConstructorOptions[]
    }
  ];

  return tpl;
}

export function init(ctx: Context) {
  const template = getMenuTpl(ctx);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

export default { init };