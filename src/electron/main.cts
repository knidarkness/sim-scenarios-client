import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import {
  getCurrentAltitude,
  setLogoLightOn,
  startSimConnect,
  stopSimConnect,
} from "./simconnet/index.cjs";

function broadcastAltitude(altitudeFeet: number): void {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.webContents.send("simconnect:altitude", altitudeFeet);
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 600,
    height: 300,
    resizable: false,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    void win.loadURL(startUrl);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("simconnect:getCurrentAltitude", () => getCurrentAltitude());
  ipcMain.handle("simconnect:setLogoLightOn", () => {
    setLogoLightOn();
    return { ok: true };
  });

  createWindow();
  startSimConnect((altitudeFeet) => {
    broadcastAltitude(altitudeFeet);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  stopSimConnect();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopSimConnect();
});
