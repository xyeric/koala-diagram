import { init, RematchRootState } from '@rematch/core'
import { app } from './app';
import { diagram } from './diagram';

const models = { app, diagram };

export const store = init({ models });

export type Store = typeof store
export type Dispatch = typeof store.dispatch
export type iRootState = RematchRootState<typeof models>

export default store;
