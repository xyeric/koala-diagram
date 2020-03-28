import { remote } from 'electron';
import { createModel } from '@rematch/core';

export const app = createModel({
  state: {
    name: remote.app.name,
    version: remote.app.getVersion(),
  },
});
