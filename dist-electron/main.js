import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCurrentAltitude, startSimConnect, stopSimConnect, } from "./simconnect/index.js";
import { EventScheduler } from "./simconnect/scheduler.js";
import { EVENT_MAP } from "./simconnect/types.js";
const eventScheduler = EventScheduler.getInstance();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function broadcastAltitude(altitudeFeet) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
        window.webContents.send("simconnect:altitude", altitudeFeet);
    });
}
function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 300,
        // resizable: false,
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
    }
    else {
        void win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
    win.webContents.on("did-finish-load", () => {
        void win.webContents
            .executeJavaScript("typeof window.simconnect")
            .then((result) => {
            console.log(`[Bridge] window.simconnect type: ${String(result)}`);
        })
            .catch((error) => {
            console.error("[Bridge] probe failed:", error);
        });
    });
}
app.whenReady().then(() => {
    ipcMain.handle("simconnect:getCurrentAltitude", () => getCurrentAltitude());
    ipcMain.handle("simconnect:setLogoLightOn", () => {
        eventScheduler.sendSimConnectEvent(EVENT_MAP.LOGO_LIGHT_SWITCH.clientEventId);
        return { ok: true };
    });
    createWindow();
    eventScheduler.connect();
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
    eventScheduler.close();
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("before-quit", () => {
    stopSimConnect();
    eventScheduler.close();
});
