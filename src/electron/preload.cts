import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("simconnect", {
  setScenarios: async (scenario: any) => ipcRenderer.invoke("simconnect:setScenarios", scenario),
  clearScenarios: () => ipcRenderer.invoke("simconnect:clearScenarios"),
});
