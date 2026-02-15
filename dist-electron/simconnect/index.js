import { open, Protocol, SimConnectConstants, SimConnectDataType, SimConnectPeriod, EventFlag, } from "node-simconnect";
import { DEFINITION_ID_ALTITUDE, EVENT_MAP, NOTIFICATION_PRIORITY_HIGHEST, REQUEST_ID_ALTITUDE, } from "./types.js";
let simConnection = null;
let latestAltitudeFeet = null;
function registerMappedEvents(handle) {
    const eventDefinitions = Object.values(EVENT_MAP);
    eventDefinitions.forEach((eventDefinition) => {
        handle.mapClientEventToSimEvent(eventDefinition.clientEventId, eventDefinition.simEventName);
    });
}
function sendSimConnectEvent(eventID) {
    if (!simConnection) {
        throw new Error("SimConnect is not connected");
    }
    simConnection.transmitClientEvent(0, eventID, 1, NOTIFICATION_PRIORITY_HIGHEST, EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY);
}
export function getCurrentAltitude() {
    return latestAltitudeFeet;
}
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function setLogoLightOn() {
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
export function startSimConnect(onAltitudeUpdate) {
    open("Sim Scenarios Electron", Protocol.KittyHawk)
        .then(({ recvOpen, handle }) => {
        simConnection = handle;
        console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);
        registerMappedEvents(handle);
        handle.addToDataDefinition(DEFINITION_ID_ALTITUDE, "PLANE ALTITUDE", "feet", SimConnectDataType.FLOAT64);
        handle.requestDataOnSimObject(REQUEST_ID_ALTITUDE, DEFINITION_ID_ALTITUDE, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SECOND);
        handle.on("simObjectData", (packet) => {
            if (packet.requestID !== REQUEST_ID_ALTITUDE) {
                return;
            }
            const altitudeFeet = packet.data.readFloat64();
            latestAltitudeFeet = altitudeFeet;
            console.log(`[SimConnect] Player altitude: ${altitudeFeet.toFixed(2)} ft`);
            onAltitudeUpdate(altitudeFeet);
        });
        handle.on("exception", (exception) => {
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
        .catch((error) => {
        console.error("[SimConnect] Connection failed:", error);
    });
}
export function stopSimConnect() {
    if (!simConnection) {
        return;
    }
    simConnection.close();
    simConnection = null;
    latestAltitudeFeet = null;
}
