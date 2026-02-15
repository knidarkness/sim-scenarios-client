const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
} = require("node-simconnect");

const DEFINITION_ID_ALTITUDE = 1;
const REQUEST_ID_ALTITUDE = 1;

let simConnection = null;
let latestAltitudeFeet = null;

function broadcastAltitude(altitudeFeet) {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.webContents.send("simconnect:altitude", altitudeFeet);
  });
}

function startSimConnectAltitudeLogging() {
  open("Sim Scenarios Electron", Protocol.KittyHawk)
    .then(({ recvOpen, handle }) => {
      simConnection = handle;
      console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

      handle.addToDataDefinition(
        DEFINITION_ID_ALTITUDE,
        "PLANE ALTITUDE",
        "feet",
        SimConnectDataType.FLOAT64
      );

      handle.requestDataOnSimObject(
        REQUEST_ID_ALTITUDE,
        DEFINITION_ID_ALTITUDE,
        SimConnectConstants.OBJECT_ID_USER,
        SimConnectPeriod.SECOND
      );

      handle.on("simObjectData", (packet) => {
        if (packet.requestID !== REQUEST_ID_ALTITUDE) {
          return;
        }

        const altitudeFeet = packet.data.readFloat64();
        latestAltitudeFeet = altitudeFeet;
        console.log(
          `[SimConnect] Player altitude: ${altitudeFeet.toFixed(2)} ft`
        );
        broadcastAltitude(altitudeFeet);
      });

      handle.on("exception", (exception) => {
        console.error("[SimConnect] Exception:", exception);
      });

      handle.on("quit", () => {
        console.log("[SimConnect] Simulator quit");
      });

      handle.on("close", () => {
        console.log("[SimConnect] Connection closed");
        simConnection = null;
        latestAltitudeFeet = null;
      });
    })
    .catch((error) => {
      console.error("[SimConnect] Connection failed:", error);
    });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 300,
    resizable: false,
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
    win.loadURL(startUrl);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("simconnect:getCurrentAltitude", () => latestAltitudeFeet);

  createWindow();
  startSimConnectAltitudeLogging();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (simConnection) {
    simConnection.close();
    simConnection = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (simConnection) {
    simConnection.close();
    simConnection = null;
  }
});
