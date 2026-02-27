import {
  ActiveScenarioItem,
  ActiveScenarioData,
  ScenarioConditionModifier,
  CONDITION_LABELS,
} from "../../types";
import { PlaneEventHandler } from "./plane_events/types";
import { AircraftEventsList } from "./plane_events/types";
import { getAircraftEventHandler } from "./plane_events";
import { SimConnectManager, SimStatus, emptySimStatus } from "./simconnect_manager";
import { NavAidDistanceChecker } from "./navaid_distance_checker";

import { ConditionKey } from "../../types";

export class EventScheduler {
  private static instance: EventScheduler | null = null;

  private simConnectManager: SimConnectManager = new SimConnectManager();
  private previousSimStatus: SimStatus = emptySimStatus();
  private latestSimStatus: SimStatus = emptySimStatus();
  private events: ActiveScenarioItem[] = [];
  private scenarioConditionsMet: Map<string, Set<string>> = new Map();
  private eventStatuses: Map<string, 'armed' | 'triggered'> = new Map();
  private aircraftEventHandler: PlaneEventHandler | null = null;
  private aircraftName: string | null = null;
  private navAidDistanceChecker = new NavAidDistanceChecker();
  private availableEvents: AircraftEventsList[] = [];
  private airportsData: Record<
    string,
    { lat: number; lon: number; alt: number }
  > = {};

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
    return this.simConnectManager.isConnected();
  }

  public setHandlerOptions(options: Record<string, any>): void {
    this.handlerOptions = {
      ...this.handlerOptions,
      ...options,
    };
  }

  public setAvailableEvents(events: AircraftEventsList[]): void {
    this.availableEvents = events;
    console.log(
      `[EventScheduler] Loaded ${events.length} aircraft event lists from API`,
    );
  }

  private onSimStatus(status: SimStatus): void {
    this.previousSimStatus = this.latestSimStatus;
    this.latestSimStatus = status;
    this.tick();
  }

  private tick() {
    if (
      !this.simConnectManager.isConnected() ||
      !this.events ||
      this.events.length === 0 ||
      !this.aircraftEventHandler
    ) {
      return;
    }
    let nextScenarios = this.events;
    for (const scenario of this.events) {
      const satisfied =
        this.scenarioConditionsMet.get(scenario.name) ?? new Set<string>();

      const simpleConditions = [
        { key: "altitude",    label: "Altitude",      configured: !!scenario.conditions?.altitude?.value,                    modifier: scenario.conditions?.altitude?.modifier,    value: scenario.conditions?.altitude?.value,    currentVal: this.latestSimStatus.altitudeFeet,        previousVal: this.previousSimStatus.altitudeFeet },
        { key: "altitudeAgl", label: "Altitude (AGL)", configured: !!scenario.conditions?.altitudeAgl?.value,               modifier: scenario.conditions?.altitudeAgl?.modifier, value: scenario.conditions?.altitudeAgl?.value, currentVal: this.latestSimStatus.altAboveGroundFeet,  previousVal: this.previousSimStatus.altAboveGroundFeet },
        { key: "speed",       label: "Speed",          configured: !!scenario.conditions?.speed?.value,                      modifier: scenario.conditions?.speed?.modifier,       value: scenario.conditions?.speed?.value,       currentVal: this.latestSimStatus.airspeedKts,         previousVal: this.previousSimStatus.airspeedKts },
        { key: "landingGear", label: "Landing gear",   configured: scenario.conditions?.landingGear?.value !== null,         modifier: scenario.conditions?.landingGear?.modifier, value: scenario.conditions?.landingGear?.value, currentVal: this.latestSimStatus.gearExtendedPercent, previousVal: this.previousSimStatus.gearExtendedPercent },
        { key: "flapPosition", label: "Flap position", configured: scenario.conditions?.flapPosition?.value !== null,        modifier: scenario.conditions?.flapPosition?.modifier, value: scenario.conditions?.flapPosition?.value, currentVal: this.latestSimStatus.flapsLeftPercent,   previousVal: this.previousSimStatus.flapsLeftPercent },
      ] as const;

      for (const cond of simpleConditions) {
        if (
          !satisfied.has(cond.key) &&
          cond.configured &&
          this.evaluateCondition(cond.modifier, cond.value, cond.currentVal, cond.previousVal)
        ) {
          satisfied.add(cond.key);
          console.log(`[Scheduler] ${cond.label} condition satisfied for "${scenario.name}"`);
        }
      }

      const currentPosition =
        this.latestSimStatus.latitude !== null &&
        this.latestSimStatus.longitude !== null &&
        this.latestSimStatus.altitudeFeet !== null
          ? {
              lat: this.latestSimStatus.latitude,
              lon: this.latestSimStatus.longitude,
              alt: this.latestSimStatus.altitudeFeet,
            }
          : null;
      const previousPosition =
        this.previousSimStatus.latitude !== null &&
        this.previousSimStatus.longitude !== null &&
        this.previousSimStatus.altitudeFeet !== null
          ? {
              lat: this.previousSimStatus.latitude,
              lon: this.previousSimStatus.longitude,
              alt: this.previousSimStatus.altitudeFeet,
            }
          : null;

      if (
        !satisfied.has("navAidDistance") &&
        scenario.conditions?.navAidDistance?.value &&
        scenario.conditions?.navAidDistance?.text &&
        currentPosition &&
        previousPosition &&
        this.airportsData[scenario.conditions.navAidDistance.text]
      ) {
        const navAidPosition =
          this.airportsData[scenario.conditions.navAidDistance.text];
        if (
          this.navAidDistanceChecker.evaluate(
            scenario.conditions.navAidDistance.modifier,
            scenario.conditions.navAidDistance.value,
            navAidPosition,
            currentPosition,
            previousPosition,
          )
        ) {
          satisfied.add("navAidDistance");
          console.log(
            `[Scheduler] NavAid distance condition satisfied for "${scenario.name}"`,
          );
        }
      }

      this.scenarioConditionsMet.set(scenario.name, satisfied);

      const allSatisfied = satisfied.size === 6;
      if (allSatisfied) {
        console.log(
          `[Scheduler] All conditions satisfied for "${scenario.name}", activating event`,
        );
        this.aircraftEventHandler.activateEvent(scenario.name);
        this.eventStatuses.set(scenario.name, 'triggered');
        nextScenarios = nextScenarios.filter((s) => s !== scenario);
        this.scenarioConditionsMet.delete(scenario.name);
      }
    }
    this.events = nextScenarios;
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

    // console.log(
    //   `Value: ${currentValue}, Previous: ${previousValue}, Parsed: ${parsedValue}, IncreasedThrough: ${increasedThrough}, DescendedThrough: ${descendedThrough}`,
    // );
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
    console.log(`Setting scenarios for aircraft: ${scenario.aircraft}`);
    this.aircraftName = scenario.aircraft;

    if (!scenario?.events || scenario.events.length === 0) {
      console.warn("No active scenarios found in the response");
      return;
    }
    const events = scenario.events.filter((e) => e.isActive);
    console.log("Active scenarios:", JSON.stringify(events, null, 2));
   
    this.events = events;
    this.scenarioConditionsMet = new Map();
    this.eventStatuses = new Map();
   
    for (const e of this.events) {
      this.eventStatuses.set(e.name, 'armed');
      const initialSatisfied = new Set<string>();
      // Pre-satisfy conditions that have no value configured
      for (const s of Object.keys(CONDITION_LABELS)) {
        const key = s as ConditionKey;
        const eventConditions = e.conditions;
        if (!eventConditions[key]?.value) {
          initialSatisfied.add(key);
        }
      }
      console.log(`Initial satisfied conditions for "${e.name}":`, Array.from(initialSatisfied));
      this.scenarioConditionsMet.set(e.name, initialSatisfied);
    }
  }

  public async startScenario(): Promise<void> {
    console.log("Starting scenario activation");
    if (!this.aircraftName || !this.events || this.events.length === 0) {
      console.warn("No scenarios to activate");
      return;
    }
    console.log(1);
    if (!this.simConnectManager.isConnected()) {
      try {
        await this.connect();
        if (!this.simConnectManager.isConnected()) {
          console.error("Failed to establish SimConnect connection");
          return;
        }
      } catch (error) {
        console.error("[SimConnect] Error while connecting:", error);
        return;
      }
    }

    console.log(2);
    this.aircraftEventHandler = getAircraftEventHandler(
      this.aircraftName,
      this.simConnectManager.getHandle()!,
      this.availableEvents,
      this.handlerOptions,
    );
console.log(3);
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
    this.events = [];
    this.scenarioConditionsMet = new Map();
    this.eventStatuses = new Map();
    this.airportsData = {};
  }

  public getEventStatuses(): Record<string, 'armed' | 'triggered'> {
    return Object.fromEntries(this.eventStatuses);
  }

  public async connect(): Promise<void> {
    const relevantIcaos = new Set<string>();
    for (const scenario of this.events) {
      if (
        scenario.conditions?.navAidDistance?.value &&
        scenario.conditions?.navAidDistance?.text
      ) {
        relevantIcaos.add(scenario.conditions.navAidDistance.text);
      }
    }

    await this.simConnectManager.connect(Array.from(relevantIcaos), {
      onSimStatus: (status) => this.onSimStatus(status),
      onAirportData: (icao, data) => {
        this.airportsData[icao] = data;
      },
      onDisconnect: () => this.close(),
    });
  }

  public close(): void {
    this.simConnectManager.close();
    this.latestSimStatus = emptySimStatus();
  }
}
