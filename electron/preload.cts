import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("simconnect", {
  getCurrentAltitude: () => ipcRenderer.invoke("simconnect:getCurrentAltitude"),
  setLogoLightOn: () => ipcRenderer.invoke("simconnect:setLogoLightOn"),
  onAltitudeUpdate: (callback: (altitudeFeet: number) => void) => {
    const listener = (_event: unknown, altitudeFeet: number) => {
      callback(altitudeFeet);
    };

    ipcRenderer.on("simconnect:altitude", listener);

    return () => {
      ipcRenderer.removeListener("simconnect:altitude", listener);
    };
  },
});
