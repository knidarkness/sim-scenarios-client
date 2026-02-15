const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("simconnect", {
  getCurrentAltitude: () => ipcRenderer.invoke("simconnect:getCurrentAltitude"),
  setLogoLightOn: () => ipcRenderer.invoke("simconnect:setLogoLightOn"),
  onAltitudeUpdate: (callback) => {
    const listener = (_event, altitudeFeet) => {
      callback(altitudeFeet);
    };

    ipcRenderer.on("simconnect:altitude", listener);

    return () => {
      ipcRenderer.removeListener("simconnect:altitude", listener);
    };
  },
});