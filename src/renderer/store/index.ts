import { init, RematchRootState } from '@rematch/core'
import { app } from './app';

const models = { app };

export const store = init({ models });

export type Store = typeof store
export type Dispatch = typeof store.dispatch
export type iRootState = RematchRootState<typeof models>

export default store;
