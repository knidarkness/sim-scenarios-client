"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("simconnect", {
    setLogoLightOn: () => electron_1.ipcRenderer.invoke("simconnect:setLogoLightOn"),
    setScenarios: (scenario) => electron_1.ipcRenderer.invoke("simconnect:setScenarios", scenario),
    clearScenarios: () => electron_1.ipcRenderer.invoke("simconnect:clearScenarios"),
});
