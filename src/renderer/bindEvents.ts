import fs from 'fs';
import path from 'path';
import { remote, ipcRenderer, ipcMain } from 'electron';
import { FileFormat, ISaveIpcOptions } from '../common/types';
import { parseToSvgCode, parseToImgBuffer } from './lib/graph';
import { formatDocTitle } from './utils/index';
import { store } from './store';

ipcRenderer.on('save-diagram', async (e, opts: ISaveIpcOptions) => {
  const { format } = opts || { format: FileFormat.MERM };
  const { diagram } = store.getState();

  let filePath = format === FileFormat.MERM ? diagram.filePath : '';

  if (!filePath) {
    const parent = remote.getCurrentWindow();
    const ret = await remote.dialog.showSaveDialog(parent, {
      filters: [{
        name: format,
        extensions: [format]
      }]
    });

    if (ret.canceled) return;

    filePath = ret.filePath;
  }

  const { sourceCode } = diagram;

  let content: any;
  if (format === FileFormat.MERM) {
    content = sourceCode;
  } else if (format === FileFormat.SVG) {
    content = await parseToSvgCode(sourceCode);
  } else {
    content = await parseToImgBuffer(sourceCode, { format });
  }

  fs.writeFileSync(filePath, content);

  const fileName = path.basename(filePath);

  store.dispatch.diagram.setFileName(fileName);
  store.dispatch.diagram.setFilePath(filePath);
  store.dispatch.diagram.setDocumentEdited(false);

  document.title = formatDocTitle(fileName);
  remote.getCurrentWindow().setDocumentEdited(false);

  ipcRenderer.send('file-opened', filePath);
});

window.addEventListener('beforeunload', (e) => {
  const { diagram } = store.getState();
  if (!diagram.contentChanged) {
    if (diagram.filePath) {
      ipcRenderer.send('file-closed', diagram.filePath);
    }
    return;
  }

  const isNewFile = !diagram.filePath;
  const clickIndex = remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    type: 'warning',
    message: `Do you want to keep this new document “${diagram.fileName}”?`,
    detail: `You can choose to save your changes, or ${isNewFile ? 'delete this document immediately' : 'discard your changes' }. You can’t undo this action.`,
    buttons: ['Save', 'Cancel', isNewFile ? 'Delete' : 'Discard' ]
  });

  if (clickIndex === 0) {
    let filePath = diagram.filePath;
    if (!filePath) {
      filePath = remote.dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        filters: [
          {
            name: FileFormat.MERM,
            extensions: [ FileFormat.MERM ]
          }
        ]
      });
    }

    if (filePath) {
      fs.writeFileSync(filePath, diagram.sourceCode);
      ipcRenderer.send('file-closed', filePath);
    } else {
      e.returnValue = false;
    }
  }

  if (clickIndex === 1) {
    e.returnValue = false;
  }
});
