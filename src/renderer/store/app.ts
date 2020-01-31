import { createModel } from '@rematch/core'

class Storage {
  static set(key: string, value: any) {
    localStorage.setItem(`koala_diagram_${key}`, JSON.stringify(value));
  }

  static get(key: string): any | undefined {
    try {
      const value = localStorage.getItem(`koala_diagram_${key}`);
      return JSON.parse(value);
    } catch (err) {
      console.error('parse storage value error', err);
    }
  }
}

export enum GraphLayout {
  SCALE = 'scale',
  STRETCH = 'stretch',
}

export enum GraphThemeColor {
  DEFAULT = '#1DD1A1',
  ORANGE = '#ff9f43',
  RED = '#ff6b6b',
  BLUE = '#54a0ff',
  PURPLE = '#5f27cd',
  DARK = '#576574',
}

export interface AppState {
  fileName: string;
  sourceCode: string;
  svgCode: string;
  contentChanged: boolean;
  themeColor: GraphThemeColor;
  graphLayout: GraphLayout;
}

export const app = createModel({
  state: {
    fileName: '',
    sourceCode: '',
    svgCode: '',
    contentChanged: false,
    themeColor: Storage.get('themeColor') || GraphThemeColor.DEFAULT,
    graphLayout: Storage.get('graphLayout') || GraphLayout.SCALE,
  },

  reducers: {
    setFileName: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        fileName: payload,
      };

      document.title = `Koala Diagram: ${payload}`;

      return state;
    },
    setSourceCode: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        sourceCode: payload,
      };

      return state;
    },
    markContentChanged: (state: AppState): AppState => {
      state = {
        ...state,
        contentChanged: true,
      };

      return state;
    },
    setSvgCode: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        svgCode: payload,
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
