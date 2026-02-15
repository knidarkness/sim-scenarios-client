import { EventFlag, open, Protocol, } from "node-simconnect";
import { EVENT_MAP, NOTIFICATION_PRIORITY_HIGHEST } from "./types.js";
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export class EventScheduler {
    constructor() {
        this.simconnect = null;
    }
    static getInstance() {
        if (!EventScheduler.instance) {
            EventScheduler.instance = new EventScheduler();
        }
        return EventScheduler.instance;
    }
    registerMappedEvents(handle) {
        const eventDefinitions = Object.values(EVENT_MAP);
        eventDefinitions.forEach((eventDefinition) => {
            handle.mapClientEventToSimEvent(eventDefinition.clientEventId, eventDefinition.simEventName);
        });
    }
    sendSimConnectEvent(eventID) {
        if (!this.simconnect) {
            throw new Error("SimConnect is not connected");
        }
        this.simconnect.transmitClientEvent(0, eventID, 1, NOTIFICATION_PRIORITY_HIGHEST, EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY);
    }
    async connect() {
        const { recvOpen, handle } = await open("Sim Scenarios Electron", Protocol.KittyHawk);
        this.simconnect = handle;
        this.registerMappedEvents(handle);
        console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);
        handle.on("exception", (exception) => {
            console.error("[SimConnect] Exception:", exception);
        });
        handle.on("quit", () => {
            console.log("[SimConnect] Simulator quit");
        });
        handle.on("close", () => {
            console.log("[SimConnect] Connection closed");
            this.close();
        });
    }
    close() {
        if (this.simconnect) {
            this.simconnect.close();
            this.simconnect = null;
            console.log("[SimConnect] Connection closed");
        }
    }
}
EventScheduler.instance = null;
