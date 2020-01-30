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
  DEFAULT = '#57606f',
  BLUE = '#00a8ff',
  PURPLE = '#5352ed',
  GREEN = '#05c46b',
}

export interface AppState {
  sourceCode: string;
  themeColor: GraphThemeColor;
  graphLayout: GraphLayout;
}

export const app = createModel({
  state: {
    sourceCode: '',
    themeColor: Storage.get('themeColor') || GraphThemeColor.DEFAULT,
    graphLayout: Storage.get('graphLayout') || GraphLayout.SCALE,
  },

  reducers: {
    setSourceCode: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        sourceCode: payload,
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
