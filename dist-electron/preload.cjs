"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("simconnect", {
    getCurrentAltitude: () => electron_1.ipcRenderer.invoke("simconnect:getCurrentAltitude"),
    setLogoLightOn: () => electron_1.ipcRenderer.invoke("simconnect:setLogoLightOn"),
    onAltitudeUpdate: (callback) => {
        const listener = (_event, altitudeFeet) => {
            callback(altitudeFeet);
        };
        electron_1.ipcRenderer.on("simconnect:altitude", listener);
        return () => {
            electron_1.ipcRenderer.removeListener("simconnect:altitude", listener);
        };
    },
});
