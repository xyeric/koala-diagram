import fs from 'fs';
import path from 'path';
import { remote, ipcRenderer } from 'electron';
import { DiagramType, FileFormat, IOpenIpcOptions, IInitIpcOptions, ISaveIpcOptions } from '../common/types';
import { svg2ImgBuffer } from './utils/index';
import { Store } from './store';
import fileTemplates from './components/editor/templates';

function bindDocInitEvent(store: Store) {
  ipcRenderer.on('open-file', (e: Event, opts: IOpenIpcOptions) => {
    if (opts.filePath && fs.existsSync(opts.filePath)) {
      const buff = fs.readFileSync(opts.filePath);
      store.dispatch.app.setFileName(path.basename(opts.filePath));
      store.dispatch.app.setSourceCode(buff.toString());
    }
  });

  ipcRenderer.on('init-with-example', (e: Event, opts: IInitIpcOptions) => {
    opts = opts || { type: DiagramType.SEQUENCE };
    if (opts.type && fileTemplates[opts.type]) {
      store.dispatch.app.setFileName(`Untitled ${remote.getCurrentWindow().id}`);
      store.dispatch.app.setSourceCode(fileTemplates[opts.type]);
    }
  });
}

function bindSaveEvent(store: Store) {
  ipcRenderer.on('save-diagram', async (e, opts: ISaveIpcOptions) => {
    const { format } = opts || { format: FileFormat.MERM };
    const parent = remote.getCurrentWindow();
    const { canceled, filePath } = await remote.dialog.showSaveDialog(parent, {
      filters: [{
        name: format,
        extensions: [format]
      }]
    });

    if (canceled) return;

    let content: any;

    const { app: appState } = store.getState();
    const { sourceCode, svgCode } = appState;

    if (format === FileFormat.MERM) {
      content = sourceCode;
    } else if (format === FileFormat.SVG) {
      content = svgCode;
    } else {
      content = await svg2ImgBuffer(svgCode, { format });
    }

    fs.writeFileSync(filePath, content);
  });
}

function bindWindowCloseEvent(store: Store) {
  window.addEventListener('beforeunload', (e) => {
    const { app: appState } = store.getState();
    if (appState.contentChanged) {
      const clickIndex = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
        type: 'warning',
        message: `Do you want to keep this new document “${appState.fileName}”?`,
        detail: 'You can choose to save your changes, or delete this document immediately. You can’t undo this action.',
        buttons: ['Save', 'Cancel', 'Delete' ]
      });

      if (clickIndex === 0) {
        const filePath = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
          filters: [
            {
              name: FileFormat.MERM,
              extensions: [ FileFormat.MERM ]
            }
          ]
        });

        if (filePath) {
          fs.writeFileSync(filePath, appState.sourceCode);
        } else {
          e.returnValue = false;
        }
      }

      if (clickIndex === 1) {
        e.returnValue = false;
      }
    }
  });
}

export function bindGlobalEvents(store: Store) {
  bindDocInitEvent(store);
  bindSaveEvent(store);
  bindWindowCloseEvent(store);
}
