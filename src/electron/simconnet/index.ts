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
const EVENT_CDU_R_L1 = 2001;
const EVENT_CDU_R_L2 = 2002;
const EVENT_CDU_R_L3 = 2003;
const EVENT_CDU_R_L4 = 2004;
const EVENT_CDU_R_L5 = 2005;
const EVENT_CDU_R_L6 = 2006;
const EVENT_CDU_R_R1 = 2007;
const EVENT_CDU_R_R2 = 2008;
const EVENT_CDU_R_R3 = 2009;
const EVENT_CDU_R_R4 = 2010;
const EVENT_CDU_R_R5 = 2011;
const EVENT_CDU_R_R6 = 2012;
const EVENT_CDU_R_EXEC = 2013;
const PMDG_EVENT_OH_LIGHTS_LOGO = "#69754";
const THIRD_PARTY_EVENT_ID_MIN = 69632;
const EVT_CDU_R_L1 = `#${THIRD_PARTY_EVENT_ID_MIN + 606}`;
const EVT_CDU_R_L2 = `#${THIRD_PARTY_EVENT_ID_MIN + 607}`;
const EVT_CDU_R_L3 = `#${THIRD_PARTY_EVENT_ID_MIN + 608}`;
const EVT_CDU_R_L4 = `#${THIRD_PARTY_EVENT_ID_MIN + 609}`;
const EVT_CDU_R_L5 = `#${THIRD_PARTY_EVENT_ID_MIN + 610}`;
const EVT_CDU_R_L6 = `#${THIRD_PARTY_EVENT_ID_MIN + 611}`;
const EVT_CDU_R_R1 = `#${THIRD_PARTY_EVENT_ID_MIN + 612}`;
const EVT_CDU_R_R2 = `#${THIRD_PARTY_EVENT_ID_MIN + 613}`;
const EVT_CDU_R_R3 = `#${THIRD_PARTY_EVENT_ID_MIN + 614}`;
const EVT_CDU_R_R4 = `#${THIRD_PARTY_EVENT_ID_MIN + 615}`;
const EVT_CDU_R_R5 = `#${THIRD_PARTY_EVENT_ID_MIN + 616}`;
const EVT_CDU_R_R6 = `#${THIRD_PARTY_EVENT_ID_MIN + 617}`;
const EVT_CDU_R_EXEC = `#${THIRD_PARTY_EVENT_ID_MIN + 628}`;
const NOTIFICATION_PRIORITY_HIGHEST = 1;




let simConnection: any = null;
let latestAltitudeFeet: number | null = null;

function registerMappedEvents(handle: any): void {
  handle.mapClientEventToSimEvent(
    EVENT_ID_LOGO_LIGHT_SWITCH,
    PMDG_EVENT_OH_LIGHTS_LOGO
  );

  handle.mapClientEventToSimEvent(EVENT_CDU_R_L1, EVT_CDU_R_L1);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_L2, EVT_CDU_R_L2);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_L3, EVT_CDU_R_L3);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_L4, EVT_CDU_R_L4);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_L5, EVT_CDU_R_L5);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_L6, EVT_CDU_R_L6);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R1, EVT_CDU_R_R1);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R2, EVT_CDU_R_R2);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R3, EVT_CDU_R_R3);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R4, EVT_CDU_R_R4);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R5, EVT_CDU_R_R5);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_R6, EVT_CDU_R_R6);
  handle.mapClientEventToSimEvent(EVENT_CDU_R_EXEC, EVT_CDU_R_EXEC);
}

function sendSimConnectEvent(eventID: number): void {
  if (!simConnection) {
    throw new Error("SimConnect is not connected");
  }

    simConnection.transmitClientEvent(
    0,
    eventID,
    1,
    NOTIFICATION_PRIORITY_HIGHEST,
    EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY
  );
}

export function getCurrentAltitude(): number | null {
  return latestAltitudeFeet;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function setLogoLightOn(): Promise<void> {
  if (!simConnection) {
    throw new Error("SimConnect is not connected");
  }

  sendSimConnectEvent(EVENT_ID_LOGO_LIGHT_SWITCH);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_R4);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L1);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L3);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L3);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L1);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L1);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_L1);
  await sleep(1000);
  sendSimConnectEvent(EVENT_CDU_R_EXEC);
}

export function startSimConnect(
  onAltitudeUpdate: (altitudeFeet: number) => void
): void {
  open("Sim Scenarios Electron", Protocol.KittyHawk)
    .then(({ recvOpen, handle }) => {
      simConnection = handle;
      console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

      registerMappedEvents(handle);

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
        stopSimConnect();
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
}
