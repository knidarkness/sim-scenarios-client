import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectConnection,
  SimConnectDataType,
  SimConnectPeriod,
} from "node-simconnect";

import {
  ActiveScenarioItem,
  ActiveScenarioData,
  ScenarioConditionModifier,
} from "../../types";
import { PlaneEventHandler } from "./plane_events/types";
import { AircraftEventsList } from "./plane_events/types";
import { getAircraftEventHandler } from "./plane_events";


const DEFINITION_ID_SIM_STATUS = 9001;
const REQUEST_ID_SIM_STATUS = 9001;

type SimStatus = {
  altitudeFeet: number | null;
  altAboveGroundFeet: number | null;
  airspeedKts: number | null;
  gearExtendedPercent: number | null;
  flapsLeftPercent: number | null;
};

export class EventScheduler {
  private static instance: EventScheduler | null = null;

  private simconnect: SimConnectConnection | null = null;
  private previousSimStatus: SimStatus = {
    altitudeFeet: null,
    altAboveGroundFeet: null,
    airspeedKts: null,
    gearExtendedPercent: null,
    flapsLeftPercent: null,
  };
  private latestSimStatus: SimStatus = {
    altitudeFeet: null,
    altAboveGroundFeet: null,
    airspeedKts: null,
    gearExtendedPercent: null,
    flapsLeftPercent: null,
  };
  private scenarios: ActiveScenarioItem[] = [];
  private scenarioConditionsMet: Map<string, Set<string>> = new Map();
  private aircraftEventHandler: PlaneEventHandler | null = null;
  private aircraftName: string | null = null;
  private availableEvents: AircraftEventsList[] = [];

  private handlerOptions: Record<string, any> = {
    wsAddress: "ws://localhost:2048/fsuipc/",
  };

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

  public setHandlerOptions(options: Record<string, any>): void {
    this.handlerOptions = {
      ...this.handlerOptions,
      ...options,
    };
  }

  public setAvailableEvents(events: AircraftEventsList[]): void {
    this.availableEvents = events;
    console.log(`[EventScheduler] Loaded ${events.length} aircraft event lists from API`);
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
      "PLANE ALT ABOVE GROUND",
      "feet",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "AIRSPEED INDICATED",
      "knots",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "GEAR TOTAL PCT EXTENDED",
      "percent",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "TRAILING EDGE FLAPS LEFT PERCENT",
      "percent",
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
      const altAboveGroundFeet = packet.data.readFloat64();
      const airspeedKts = packet.data.readFloat64();
      const gearExtendedPercent = packet.data.readFloat64();
      const flapsLeftPercent = packet.data.readFloat64();
      // console.log({
      //   altitudeFeet,
      //   altAboveGroundFeet,
      //   airspeedKts,
      //   gearExtendedPercent,
      //   flapsLeftPercent,
      // });
      this.previousSimStatus = this.latestSimStatus;
      this.latestSimStatus = {
        altitudeFeet,
        altAboveGroundFeet,
        airspeedKts,
        gearExtendedPercent,
        flapsLeftPercent,
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
      const satisfied = this.scenarioConditionsMet.get(scenario.name) ?? new Set<string>();

      if (!satisfied.has("altitude") && scenario.conditions.altitude.value &&
        this.evaluateCondition(
          scenario.conditions.altitude.modifier,
          scenario.conditions.altitude.value,
          this.latestSimStatus.altitudeFeet,
          this.previousSimStatus.altitudeFeet,
        )) {
        satisfied.add("altitude");
        console.log(`[Scheduler] Altitude condition satisfied for "${scenario.name}"`);
      }

      if (!satisfied.has("speed") && scenario.conditions.speed.value &&
        this.evaluateCondition(
          scenario.conditions.speed.modifier,
          scenario.conditions.speed.value,
          this.latestSimStatus.airspeedKts,
          this.previousSimStatus.airspeedKts,
        )) {
        satisfied.add("speed");
        console.log(`[Scheduler] Speed condition satisfied for "${scenario.name}"`);
      }

      if (!satisfied.has("landingGear") && scenario.conditions.landingGear.value !== null &&
        this.evaluateCondition(
          scenario.conditions.landingGear.modifier,
          scenario.conditions.landingGear.value,
          this.latestSimStatus.gearExtendedPercent,
          this.previousSimStatus.gearExtendedPercent,
        )) {
        satisfied.add("landingGear");
        console.log(`[Scheduler] Landing gear condition satisfied for "${scenario.name}"`);
      }

      if (!satisfied.has("flapPosition") && scenario.conditions.flapPosition.value !== null &&
        this.evaluateCondition(
          scenario.conditions.flapPosition.modifier,
          scenario.conditions.flapPosition.value,
          this.latestSimStatus.flapsLeftPercent,
          this.previousSimStatus.flapsLeftPercent,
        )) {
        satisfied.add("flapPosition");
        console.log(`[Scheduler] Flap position condition satisfied for "${scenario.name}"`);
      }

      this.scenarioConditionsMet.set(scenario.name, satisfied);

      const allSatisfied = satisfied.size === 4;
      if (allSatisfied) {
        console.log(`[Scheduler] All conditions satisfied for "${scenario.name}", activating event`);
        this.aircraftEventHandler.activateEvent(scenario.name);
        nextScenarios = nextScenarios.filter((s) => s !== scenario);
        this.scenarioConditionsMet.delete(scenario.name);
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
    if (value === null || currentValue === null || previousValue === null) {
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
        // Attention: use || increasedThrough === descendedThrough if you want to just check state - and not transition into state.
        increasedThrough || descendedThrough
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

  public async setScenarios(scenario: ActiveScenarioData): Promise<void> {
    console.log(
      `Setting scenarios for aircraft: ${scenario.aircraft}`,
    );
    this.aircraftName = scenario.aircraft;

    if (!scenario?.events || scenario.events.length === 0) {
      console.warn("No active scenarios found in the response");
      return;
    }
    const scenarios = scenario.events.filter(
      (s) => s.isActive,
    );
    console.log("Active scenarios:", JSON.stringify(scenarios, null, 2));
    this.scenarios = scenarios;

    this.scenarioConditionsMet = new Map();
    for (const s of this.scenarios) {
      const initialSatisfied = new Set<string>();
      // Pre-satisfy conditions that have no value configured
      if (!s.conditions.altitude.value) initialSatisfied.add("altitude");
      if (!s.conditions.speed.value) initialSatisfied.add("speed");
      if (s.conditions.landingGear.value === null) initialSatisfied.add("landingGear");
      if (s.conditions.flapPosition.value === null) initialSatisfied.add("flapPosition");
      this.scenarioConditionsMet.set(s.name, initialSatisfied);
    }
  }

  public async startScenario(): Promise<void> {
    console.log("Starting scenario activation");
    if (!this.aircraftName || !this.scenarios || this.scenarios.length === 0) {
      console.warn("No scenarios to activate");
      return;
    }
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
      this.aircraftName,
      this.simconnect,
      this.availableEvents,
      this.handlerOptions,
    );

    if (!this.aircraftEventHandler) {
      console.warn(`No event handler found for aircraft: ${this.aircraftName}`);
      return;
    }

    if (this.aircraftEventHandler) {
      this.aircraftEventHandler.start();
    }
  }

  public clearScenarios(): void {
    if (this.aircraftEventHandler) {
      this.aircraftEventHandler.stop();
    }
    this.close();
    this.scenarios = [];
    this.scenarioConditionsMet = new Map();
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
      altAboveGroundFeet: null,
      airspeedKts: null,
      gearExtendedPercent: null,
      flapsLeftPercent: null,
    };
  }
}
