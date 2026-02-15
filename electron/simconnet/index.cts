import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
  EventFlag,
} from "node-simconnect";

const DEFINITION_ID_ALTITUDE = 1;
const REQUEST_ID_ALTITUDE = 1;
const EVENT_ID_LOGO_LIGHT_SWITCH = 1001;
const PMDG_EVENT_OH_LIGHTS_LOGO = "#69754";
const NOTIFICATION_PRIORITY_HIGHEST = 1;

let simConnection: any = null;
let latestAltitudeFeet: number | null = null;
let isLogoEventMapped = false;

export function getCurrentAltitude(): number | null {
  return latestAltitudeFeet;
}

export function setLogoLightOn(): void {
  if (!simConnection) {
    throw new Error("SimConnect is not connected");
  }

  if (!isLogoEventMapped) {
    throw new Error("Logo light event is not mapped yet");
  }

  simConnection.transmitClientEvent(
    0,
    EVENT_ID_LOGO_LIGHT_SWITCH,
    1,
    NOTIFICATION_PRIORITY_HIGHEST,
    EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY
  );
}

export function startSimConnect(
  onAltitudeUpdate: (altitudeFeet: number) => void
): void {
  open("Sim Scenarios Electron", Protocol.KittyHawk)
    .then(({ recvOpen, handle }) => {
      simConnection = handle;
      isLogoEventMapped = false;
      console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

      handle.mapClientEventToSimEvent(
        EVENT_ID_LOGO_LIGHT_SWITCH,
        PMDG_EVENT_OH_LIGHTS_LOGO
      );
      isLogoEventMapped = true;

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

      handle.on("simObjectData", (packet: any) => {
        if (packet.requestID !== REQUEST_ID_ALTITUDE) {
          return;
        }

        const altitudeFeet = packet.data.readFloat64();
        latestAltitudeFeet = altitudeFeet;
        console.log(
          `[SimConnect] Player altitude: ${altitudeFeet.toFixed(2)} ft`
        );
        onAltitudeUpdate(altitudeFeet);
      });

      handle.on("exception", (exception: unknown) => {
        console.error("[SimConnect] Exception:", exception);
      });

      handle.on("quit", () => {
        console.log("[SimConnect] Simulator quit");
      });

      handle.on("close", () => {
        console.log("[SimConnect] Connection closed");
        simConnection = null;
        latestAltitudeFeet = null;
        isLogoEventMapped = false;
      });
    })
    .catch((error: unknown) => {
      console.error("[SimConnect] Connection failed:", error);
    });
}

export function stopSimConnect(): void {
  if (!simConnection) {
    return;
  }

  simConnection.close();
  simConnection = null;
  latestAltitudeFeet = null;
  isLogoEventMapped = false;
}
