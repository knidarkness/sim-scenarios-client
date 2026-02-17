import {
  EventFlag,
  open,
  Protocol,
  SimConnectConstants,
  SimConnectConnection,
  SimConnectDataType,
  SimConnectPeriod,
} from "node-simconnect";

import {
  ActiveScenarioItem,
  ActiveScenarioResponse,
  EVENT_MAP,
  EventMapEntry,
  NOTIFICATION_PRIORITY_HIGHEST,
  ScenarioConditionModifier,
} from "./types.js";
import { PMDG_73X_CDU_COMMANDS } from "./simconnect_events.js";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const DEFINITION_ID_SIM_STATUS = 9001;
const REQUEST_ID_SIM_STATUS = 9001;

type SimStatus = {
  altitudeFeet: number | null;
  airspeedKts: number | null;
};

export class EventScheduler {
  private static instance: EventScheduler | null = null;

  private simconnect: SimConnectConnection | null = null;
  private previousSimStatus: SimStatus = {
    altitudeFeet: null,
    airspeedKts: null,
  };
  private latestSimStatus: SimStatus = {
    altitudeFeet: null,
    airspeedKts: null,
  };
  private scenarios: ActiveScenarioItem[] = [];
  private inputEventQueue: EventMapEntry[] = [];
  private inputEventIntervalHandle: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): EventScheduler {
    if (!EventScheduler.instance) {
      EventScheduler.instance = new EventScheduler();
    }

    return EventScheduler.instance;
  }

  public isConnected(): boolean {
    return this.simconnect !== null;
  }

  private registerMappedEvents(handle: SimConnectConnection): void {
    const eventDefinitions = Object.values(EVENT_MAP) as Array<
      (typeof EVENT_MAP)[keyof typeof EVENT_MAP]
    >;

    eventDefinitions.forEach((eventDefinition) => {
      handle.mapClientEventToSimEvent(
        eventDefinition.clientEventId,
        eventDefinition.simEventName,
      );
    });
  }

  private startMonitoringSimStatus(handle: SimConnectConnection): void {
    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "PLANE ALTITUDE",
      "feet",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "AIRSPEED INDICATED",
      "knots",
      SimConnectDataType.FLOAT64,
    );

    handle.requestDataOnSimObject(
      REQUEST_ID_SIM_STATUS,
      DEFINITION_ID_SIM_STATUS,
      SimConnectConstants.OBJECT_ID_USER,
      SimConnectPeriod.SECOND,
    );

    handle.on("simObjectData", (packet: any) => {
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

  private tick() {
    if (!this.simconnect || !this.scenarios || this.scenarios.length === 0) {
      return;
    }
    let nextScenarios = this.scenarios;
    for (const scenario of this.scenarios) {
      const conditions =
        !!scenario.conditions.altitude.value ||
        !!scenario.conditions.speed.value;
      if (!conditions) {
        this.activateEvent(scenario.name);
        nextScenarios = nextScenarios.filter((s) => s !== scenario);
        continue;
      }
      const altitudeConditionMet =
        !scenario.conditions.altitude.value ||
        this.evaluateCondition(
          scenario.conditions.altitude.modifier,
          scenario.conditions.altitude.value,
          this.latestSimStatus.altitudeFeet,
          this.previousSimStatus.altitudeFeet,
        );

      const speedConditionMet =
        !scenario.conditions.speed.value ||
        this.evaluateCondition(
          scenario.conditions.speed.modifier,
          scenario.conditions.speed.value,
          this.latestSimStatus.airspeedKts,
          this.previousSimStatus.airspeedKts,
        );

      if (altitudeConditionMet && speedConditionMet) {
        this.activateEvent(scenario.name);
        nextScenarios = nextScenarios.filter((s) => s !== scenario);
      }
    }
    this.scenarios = nextScenarios;
  }

  private evaluateCondition(
    modifier: ScenarioConditionModifier,
    value: string | null,
    currentValue: number | null,
    previousValue: number | null,
  ): boolean {
    if (value === null || currentValue === null) {
      return false;
    }

    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return false;
    }
    const increasedThrough =
      previousValue !== null &&
      currentValue !== null &&
      previousValue < parsedValue &&
      currentValue >= parsedValue;
    const descendedThrough =
      previousValue !== null &&
      currentValue !== null &&
      previousValue > parsedValue &&
      currentValue <= parsedValue;

    console.log(
      `Value: ${currentValue}, Previous: ${previousValue}, Parsed: ${parsedValue}, IncreasedThrough: ${increasedThrough}, DescendedThrough: ${descendedThrough}`,
    );
    if (modifier === "Equals") {
      return (
        increasedThrough || descendedThrough || currentValue === parsedValue
      );
    }
    if (modifier === "Increasing through") {
      return increasedThrough;
    }
    if (modifier === "Descending through") {
      return descendedThrough;
    }

    return false;
  }

  private async activateEvent(eventName: string) {

    const eventInputs = PMDG_73X_CDU_COMMANDS[eventName as keyof typeof PMDG_73X_CDU_COMMANDS];
    if (!eventInputs) {
      console.warn(`No mapped events found for scenario: ${eventName}`);
      return;
    }
    this.inputEventQueue.push(...eventInputs);
    console.log(`Activating event for scenario: ${eventName}`);
  }

  public getSimStatus(): SimStatus {
    return this.latestSimStatus;
  }

  private startTickInputEvents() {
    this.inputEventIntervalHandle = setInterval(() => {
      if (!this.simconnect || this.inputEventQueue.length === 0) {
        return;
      }
      const event = this.inputEventQueue.shift();
      if (event) {
        this.sendSimConnectEvent(event.clientEventId);
      }
    }, 1000);
  }
  private stopTickInputEvents() {
    if (this.inputEventIntervalHandle) {
      clearInterval(this.inputEventIntervalHandle);
      this.inputEventIntervalHandle = null;
    }
  }

  public async setScenarios(scenario: ActiveScenarioResponse): Promise<void> {
    if (!this.simconnect) {
      try {
        await this.connect();
      } catch (error) {
        console.error("[SimConnect] Error while connecting:", error);
        return;
      }
    }
    if (!scenario?.activeScenario || !scenario.activeScenario?.scenarios) {
      console.warn("No active scenarios found in the response");
      return;
    }
    const scenarios = scenario.activeScenario.scenarios.filter(
      (s) => s.isActive,
    );
    console.log("Active scenarios:", scenarios);
    this.scenarios = scenarios;
    this.inputEventQueue = [];
    this.startTickInputEvents();
  }

  public clearScenarios(): void {
    this.stopTickInputEvents();
    this.scenarios = [];
    this.inputEventQueue = [];
  }

  public sendSimConnectEvent(eventID: number): void {
    if (!this.simconnect) {
      throw new Error("SimConnect is not connected");
    }

    this.simconnect.transmitClientEvent(
      0,
      eventID,
      1,
      NOTIFICATION_PRIORITY_HIGHEST,
      EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY,
    );
  }

  public async connect() {
    const { recvOpen, handle } = await open(
      "Sim Scenarios Electron",
      Protocol.KittyHawk,
    );
    this.simconnect = handle;
    this.registerMappedEvents(handle);
    this.startMonitoringSimStatus(handle);
    console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

    handle.on("exception", (exception: unknown) => {
      console.error("[SimConnect] Exception:", exception);
    });

    handle.on("quit", () => {
      console.log("[SimConnect] Simulator quit");
      this.close();
    });

    handle.on("close", () => {
      console.log("[SimConnect] Connection closed");
      this.close();
    });
  }

  public close() {
    if (!this.simconnect) {
      return;
    }
    try {
      this.simconnect.close();
    } catch (error) {
      console.error("[SimConnect] Error while closing connection:", error);
    }
    this.simconnect = null;
    this.latestSimStatus = {
      altitudeFeet: null,
      airspeedKts: null,
    };
  }
}
