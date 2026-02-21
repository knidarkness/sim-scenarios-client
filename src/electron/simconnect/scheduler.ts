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
  ScenarioConditionModifier,
} from "./types";
import { PlaneEventHandler} from "./plane_events/types";
import { getAircraftEventHandler } from "./plane_events";

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
  private aircraft: string | undefined = "PMDG73X";
  private aircraftEventHandler: PlaneEventHandler | null = null;
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
    if (
      !this.simconnect ||
      !this.scenarios ||
      this.scenarios.length === 0 ||
      !this.aircraftEventHandler
    ) {
      return;
    }
    let nextScenarios = this.scenarios;
    for (const scenario of this.scenarios) {
      const conditions =
        !!scenario.conditions.altitude.value ||
        !!scenario.conditions.speed.value;
      if (!conditions) {
        this.aircraftEventHandler.activateEvent(scenario.name);
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
        this.aircraftEventHandler.activateEvent(scenario.name);
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

  public async setScenarios(scenario: ActiveScenarioResponse): Promise<void> {
    if (!this.simconnect) {
      try {
        await this.connect();
        if (!this.simconnect) {
          console.error("Failed to establish SimConnect connection");
          return;
        }
      } catch (error) {
        console.error("[SimConnect] Error while connecting:", error);
        return;
      }
    }

    this.aircraftEventHandler = getAircraftEventHandler(
      scenario.activeScenario.aircraft,
      this.simconnect,
    );

    if (!scenario?.activeScenario || !scenario.activeScenario?.scenarios) {
      console.warn("No active scenarios found in the response");
      return;
    }
    const scenarios = scenario.activeScenario.scenarios.filter(
      (s) => s.isActive,
    );
    console.log("Active scenarios:", scenarios);
    this.scenarios = scenarios;
    this.aircraft = scenario.activeScenario.aircraft;
  }

  public clearScenarios(): void {
    this.scenarios = [];
    if (this.aircraftEventHandler) {
      this.aircraftEventHandler.stop();
    }
  }

  public async connect() {
    const { recvOpen, handle } = await open(
      "Sim Scenarios Electron",
      Protocol.KittyHawk,
    );
    this.simconnect = handle;
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
