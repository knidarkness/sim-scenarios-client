import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("simconnect", {
  setLogoLightOn: () => ipcRenderer.invoke("simconnect:setLogoLightOn"),
  setScenarios: (scenario: any) => ipcRenderer.invoke("simconnect:setScenarios", scenario),
  clearScenarios: () => ipcRenderer.invoke("simconnect:clearScenarios"),
});
