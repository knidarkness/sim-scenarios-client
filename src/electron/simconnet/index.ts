import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
  EventFlag,
} from "node-simconnect";
import {
  DEFINITION_ID_ALTITUDE,
  EVENT_MAP,
  NOTIFICATION_PRIORITY_HIGHEST,
  REQUEST_ID_ALTITUDE,
} from "./types.js";






let simConnection: any = null;
let latestAltitudeFeet: number | null = null;

function registerMappedEvents(handle: any): void {
  const eventDefinitions = Object.values(EVENT_MAP) as Array<
    (typeof EVENT_MAP)[keyof typeof EVENT_MAP]
  >;

  eventDefinitions.forEach((eventDefinition) => {
    handle.mapClientEventToSimEvent(
      eventDefinition.clientEventId,
      eventDefinition.simEventName
    );
  });
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

  sendSimConnectEvent(EVENT_MAP.LOGO_LIGHT_SWITCH.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_R4.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L1.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L3.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L3.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L1.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L1.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_L1.clientEventId);
  await sleep(1000);
  sendSimConnectEvent(EVENT_MAP.CDU_R_EXEC.clientEventId);
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
