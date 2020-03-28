import fs from 'fs';
import path from 'path';
import { remote, ipcRenderer } from 'electron';
import { createModel } from '@rematch/core';
import Storage from '../lib/storage';
import { GraphThemeColor } from '../lib/theme';
import { parseUrlParams, formatDocTitle } from '../utils/index';
import fileTemplates from '../components/editor/templates';

export enum GraphLayout {
  SCALE = 'scale',
  STRETCH = 'stretch',
}

export interface AppState {
  fileName?: string;
  filePath?: string;
  sourceCode: string;
  contentChanged: boolean;
  themeColor: GraphThemeColor;
  graphLayout: GraphLayout;
}

function getInitState() {
  const themeColor = Storage.get('themeColor') || GraphThemeColor.DEFAULT;
  const graphLayout = Storage.get('graphLayout') || GraphLayout.SCALE;

  const initState = {
    fileName: '',
    filePath: '',
    sourceCode: '',
    contentChanged: false,
    themeColor,
    graphLayout,
  };

  const urlArgs = parseUrlParams();
  if (urlArgs.useExample) {
    initState.fileName = 'Untitled';
    initState.sourceCode = fileTemplates[urlArgs.useExample] || '';

    document.title = formatDocTitle(initState.fileName);
  }

  if (urlArgs.filePath) {
    const buff = fs.readFileSync(urlArgs.filePath);
    initState.sourceCode = buff.toString();

    initState.fileName = path.basename(urlArgs.filePath);
    initState.filePath = urlArgs.filePath;

    document.title = formatDocTitle(initState.fileName);

    ipcRenderer.send('file-opened', initState.filePath);
  }

  return initState;
}

export const diagram = createModel({
  state: getInitState(),

  reducers: {
    setFileName: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        fileName: payload,
      };

      document.title = formatDocTitle(payload);

      return state;
    },
    setFilePath: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        filePath: payload,
      };

      return state;
    },
    setSourceCode: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        sourceCode: payload,
        contentChanged: true,
      };

      remote.getCurrentWindow().setDocumentEdited(true);

      return state;
    },
    setDocumentEdited: (state: AppState, isEdit: boolean): AppState => {
      state = {
        ...state,
        contentChanged: isEdit,
      };

      return state;
    },
    setGraphLayout: (state: AppState, payload: GraphLayout): AppState => {
      state = {
        ...state,
        graphLayout: payload,
      };

      Storage.set('graphLayout', payload);

      return state;
    },
    setThemeColor: (state: AppState, payload: GraphThemeColor): AppState => {
      state = {
        ...state,
        themeColor: payload,
      };

      Storage.set('themeColor', payload);

      return state;
    },
  },
});
