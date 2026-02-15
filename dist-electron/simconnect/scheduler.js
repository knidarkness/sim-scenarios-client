import { EventFlag, open, Protocol, SimConnectConstants, SimConnectDataType, SimConnectPeriod, } from "node-simconnect";
import { EVENT_MAP, NOTIFICATION_PRIORITY_HIGHEST, } from "./types.js";
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
const DEFINITION_ID_SIM_STATUS = 9001;
const REQUEST_ID_SIM_STATUS = 9001;
export class EventScheduler {
    constructor() {
        this.simconnect = null;
        this.previousSimStatus = {
            altitudeFeet: null,
            airspeedKts: null,
        };
        this.latestSimStatus = {
            altitudeFeet: null,
            airspeedKts: null,
        };
        this.scenarios = [];
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
    startMonitoringSimStatus(handle) {
        handle.addToDataDefinition(DEFINITION_ID_SIM_STATUS, "PLANE ALTITUDE", "feet", SimConnectDataType.FLOAT64);
        handle.addToDataDefinition(DEFINITION_ID_SIM_STATUS, "AIRSPEED INDICATED", "knots", SimConnectDataType.FLOAT64);
        handle.requestDataOnSimObject(REQUEST_ID_SIM_STATUS, DEFINITION_ID_SIM_STATUS, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SECOND);
        handle.on("simObjectData", (packet) => {
            if (packet.requestID !== REQUEST_ID_SIM_STATUS) {
                return;
            }
            const altitudeFeet = packet.data.readFloat64();
            const airspeedKts = packet.data.readFloat64();
            console.log({
                altitudeFeet,
                airspeedKts,
            });
            this.previousSimStatus = this.latestSimStatus;
            this.latestSimStatus = {
                altitudeFeet,
                airspeedKts,
            };
            this.tick();
        });
    }
    tick() {
        if (!this.simconnect || !this.scenarios || this.scenarios.length === 0) {
            return;
        }
        for (const scenario of this.scenarios) {
            const conditions = !!scenario.conditions.altitude.value ||
                !!scenario.conditions.speed.value;
            if (!conditions) {
                this.activateEvent(scenario.name);
                continue;
            }
            const altitudeConditionMet = !scenario.conditions.altitude.value ||
                this.evaluateCondition(scenario.conditions.altitude.modifier, scenario.conditions.altitude.value, this.latestSimStatus.altitudeFeet, this.previousSimStatus.altitudeFeet);
            const speedConditionMet = !scenario.conditions.speed.value ||
                this.evaluateCondition(scenario.conditions.speed.modifier, scenario.conditions.speed.value, this.latestSimStatus.airspeedKts, this.previousSimStatus.airspeedKts);
            if (altitudeConditionMet && speedConditionMet) {
                this.activateEvent(scenario.name);
            }
        }
    }
    evaluateCondition(modifier, value, currentValue, previousValue) {
        if (value === null || currentValue === null) {
            return false;
        }
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            return false;
        }
        const increasedThrough = previousValue !== null &&
            currentValue !== null &&
            previousValue < parsedValue &&
            currentValue >= parsedValue;
        const descendedThrough = previousValue !== null &&
            currentValue !== null &&
            previousValue > parsedValue &&
            currentValue <= parsedValue;
        console.log(`Value: ${currentValue}, Previous: ${previousValue}, Parsed: ${parsedValue}, IncreasedThrough: ${increasedThrough}, DescendedThrough: ${descendedThrough}`);
        if (modifier === "Equals") {
            return (increasedThrough || descendedThrough || currentValue === parsedValue);
        }
        if (modifier === "Increasing through") {
            return increasedThrough;
        }
        if (modifier === "Descending through") {
            return descendedThrough;
        }
        return false;
    }
    async activateEvent(eventName) {
        const eng1FaultButtons = [
            EVENT_MAP.CDU_R_MENU,
            EVENT_MAP.CDU_R_R4,
            EVENT_MAP.CDU_R_L1,
            EVENT_MAP.CDU_R_L3,
            EVENT_MAP.CDU_R_NEXT_PAGE,
            EVENT_MAP.CDU_R_L2,
            EVENT_MAP.CDU_R_L1,
            EVENT_MAP.CDU_R_L3,
            EVENT_MAP.CDU_R_L1,
            EVENT_MAP.CDU_R_EXEC,
        ];
        for (const button of eng1FaultButtons) {
            this.sendSimConnectEvent(button.clientEventId);
            await sleep(1000);
        }
        console.log(`Activating event for scenario: ${eventName}`);
    }
    getSimStatus() {
        return this.latestSimStatus;
    }
    setScenarios(scenario) {
        const scenarios = scenario.activeScenario.scenarios.filter((s) => s.isActive);
        console.log("Active scenarios:", scenarios);
        this.scenarios = scenarios;
    }
    clearScenarios() {
        this.scenarios = [];
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
        this.startMonitoringSimStatus(handle);
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
            this.latestSimStatus = {
                altitudeFeet: null,
                airspeedKts: null,
            };
        }
    }
}
EventScheduler.instance = null;
