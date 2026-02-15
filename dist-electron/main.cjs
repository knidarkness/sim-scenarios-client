"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const index_cjs_1 = require("./simconnet/index.cjs");
function broadcastAltitude(altitudeFeet) {
    const windows = electron_1.BrowserWindow.getAllWindows();
    windows.forEach((window) => {
        window.webContents.send("simconnect:altitude", altitudeFeet);
    });
}
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 600,
        height: 300,
        resizable: false,
        useContentSize: true,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: node_path_1.default.join(__dirname, "preload.cjs"),
        },
    });
    const startUrl = process.env.ELECTRON_START_URL;
    if (startUrl) {
        void win.loadURL(startUrl);
    }
    else {
        void win.loadFile(node_path_1.default.join(__dirname, "../dist/index.html"));
    }
}
electron_1.app.whenReady().then(() => {
    electron_1.ipcMain.handle("simconnect:getCurrentAltitude", () => (0, index_cjs_1.getCurrentAltitude)());
    electron_1.ipcMain.handle("simconnect:setLogoLightOn", () => {
        (0, index_cjs_1.setLogoLightOn)();
        return { ok: true };
    });
    createWindow();
    (0, index_cjs_1.startSimConnect)((altitudeFeet) => {
        broadcastAltitude(altitudeFeet);
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    (0, index_cjs_1.stopSimConnect)();
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("before-quit", () => {
    (0, index_cjs_1.stopSimConnect)();
});
