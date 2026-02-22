import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";


import { EventScheduler } from "./simconnect/scheduler";
import { EVENT_MAP } from "./simconnect/types";
import { ActiveScenarioResponse } from "./simconnect/types";

const eventScheduler = EventScheduler.getInstance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function createWindow(): void {
  const win = new BrowserWindow({
    width: 600,
    height: 300,
    resizable: true,
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

  win.webContents.on("did-finish-load", () => {
    void win.webContents
      .executeJavaScript("typeof window.simconnect")
      .then((result) => {
        console.log(`[Bridge] window.simconnect type: ${String(result)}`);
      })
      .catch((error: unknown) => {
        console.error("[Bridge] probe failed:", error);
      });
  });
}

app.whenReady().then(async () => {
  ipcMain.handle("simconnect:setScenarios", async (_event, scenario: ActiveScenarioResponse) => {
    await eventScheduler.setScenarios(scenario);
    return { ok: true };
  });

  ipcMain.handle("simconnect:clearScenarios", () => {
    eventScheduler.clearScenarios();
    return { ok: true };
  });

  ipcMain.handle("simconnect:activateScenarios", async () => {
    await eventScheduler.startScenario();
    return { ok: true };
  });

  ipcMain.handle("simconnect:setHandlerOptions", (_event, options: Record<string, any>) => {
    eventScheduler.setHandlerOptions(options);
    return { ok: true };
  });

  createWindow();


  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  eventScheduler.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  eventScheduler.close();
});
