
import { app } from "electron";

export interface Context {
  app: Electron.App;
  mainWindow?: Electron.BrowserWindow;
}

const ctx: Context = {
  app,
};

export default ctx;
