import { createModel } from '@rematch/core'

export interface AppState {
  sourceCode: string;
}
export const app = createModel({
  state: {
    sourceCode: '',
  },

  reducers: {
    setSourceCode: (state: AppState, payload: string): AppState => {
      state = {
        ...state,
        sourceCode: payload,
      };

      return state;
    },
  },
});
