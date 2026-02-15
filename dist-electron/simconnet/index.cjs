"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAltitude = getCurrentAltitude;
exports.setLogoLightOn = setLogoLightOn;
exports.startSimConnect = startSimConnect;
exports.stopSimConnect = stopSimConnect;
const node_simconnect_1 = require("node-simconnect");
const DEFINITION_ID_ALTITUDE = 1;
const REQUEST_ID_ALTITUDE = 1;
const EVENT_ID_LOGO_LIGHT_SWITCH = 1001;
const PMDG_EVENT_OH_LIGHTS_LOGO = "#69754";
const NOTIFICATION_PRIORITY_HIGHEST = 1;
let simConnection = null;
let latestAltitudeFeet = null;
let isLogoEventMapped = false;
function getCurrentAltitude() {
    return latestAltitudeFeet;
}
function setLogoLightOn() {
    if (!simConnection) {
        throw new Error("SimConnect is not connected");
    }
    if (!isLogoEventMapped) {
        throw new Error("Logo light event is not mapped yet");
    }
    simConnection.transmitClientEvent(0, EVENT_ID_LOGO_LIGHT_SWITCH, 1, NOTIFICATION_PRIORITY_HIGHEST, node_simconnect_1.EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY);
}
function startSimConnect(onAltitudeUpdate) {
    (0, node_simconnect_1.open)("Sim Scenarios Electron", node_simconnect_1.Protocol.KittyHawk)
        .then(({ recvOpen, handle }) => {
        simConnection = handle;
        isLogoEventMapped = false;
        console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);
        handle.mapClientEventToSimEvent(EVENT_ID_LOGO_LIGHT_SWITCH, PMDG_EVENT_OH_LIGHTS_LOGO);
        isLogoEventMapped = true;
        handle.addToDataDefinition(DEFINITION_ID_ALTITUDE, "PLANE ALTITUDE", "feet", node_simconnect_1.SimConnectDataType.FLOAT64);
        handle.requestDataOnSimObject(REQUEST_ID_ALTITUDE, DEFINITION_ID_ALTITUDE, node_simconnect_1.SimConnectConstants.OBJECT_ID_USER, node_simconnect_1.SimConnectPeriod.SECOND);
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
            simConnection = null;
            latestAltitudeFeet = null;
            isLogoEventMapped = false;
        });
    })
        .catch((error) => {
        console.error("[SimConnect] Connection failed:", error);
    });
}
function stopSimConnect() {
    if (!simConnection) {
        return;
    }
    simConnection.close();
    simConnection = null;
    latestAltitudeFeet = null;
    isLogoEventMapped = false;
}
