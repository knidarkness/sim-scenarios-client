import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("simconnect", {
  setScenarios: async (scenario: any) => ipcRenderer.invoke("simconnect:setScenarios", scenario),
  clearScenarios: () => ipcRenderer.invoke("simconnect:clearScenarios"),
  activateScenarios: async () => ipcRenderer.invoke("simconnect:activateScenarios"),
  setAircraftHandlerOptions: (options: Record<string, any>) => ipcRenderer.invoke("simconnect:setHandlerOptions", options),
});
