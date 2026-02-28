import {
  ActiveScenarioItem,
  ActiveScenarioData,
  ScenarioConditionModifier,
  CONDITION_LABELS,
} from "../../types";
import { PlaneEventHandler } from "./plane_events/types";
import { AircraftEventsList } from "./plane_events/types";
import { getAircraftEventHandler } from "./plane_events";
import {
  SimConnectManager,
  SimStatus,
  emptySimStatus,
} from "./simconnect_manager";
import { NavAidDistanceChecker } from "./navaid_distance_checker";

import { ConditionKey } from "../../types";

export class EventScheduler {
  private static instance: EventScheduler | null = null;

  private simConnectManager: SimConnectManager = new SimConnectManager();
  private previousSimStatus: SimStatus = emptySimStatus();
  private latestSimStatus: SimStatus = emptySimStatus();
  private events: ActiveScenarioItem[] = [];
  private scenarioConditionsMet: Map<string, Set<string>> = new Map();
  private eventStatuses: Map<string, "armed" | "triggered"> = new Map();
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
    for (const event of this.events) {
      const satisfied =
        this.scenarioConditionsMet.get(event.name) ?? new Set<string>();

      const simpleConditions = [
        {
          key: "altitude",
          label: "Altitude",
          configured: !!event.conditions?.altitude?.value,
          modifier: event.conditions?.altitude?.modifier,
          value: event.conditions?.altitude?.value,
          currentVal: this.latestSimStatus.altitudeFeet,
          previousVal: this.previousSimStatus.altitudeFeet,
        },
        {
          key: "altitudeAgl",
          label: "Altitude (AGL)",
          configured: !!event.conditions?.altitudeAgl?.value,
          modifier: event.conditions?.altitudeAgl?.modifier,
          value: event.conditions?.altitudeAgl?.value,
          currentVal: this.latestSimStatus.altAboveGroundFeet,
          previousVal: this.previousSimStatus.altAboveGroundFeet,
        },
        {
          key: "speed",
          label: "Speed",
          configured: !!event.conditions?.speed?.value,
          modifier: event.conditions?.speed?.modifier,
          value: event.conditions?.speed?.value,
          currentVal: this.latestSimStatus.airspeedKts,
          previousVal: this.previousSimStatus.airspeedKts,
        },
        {
          key: "landingGear",
          label: "Landing gear",
          configured: event.conditions?.landingGear?.value !== null,
          modifier: event.conditions?.landingGear?.modifier,
          value: event.conditions?.landingGear?.value,
          currentVal: this.latestSimStatus.gearExtendedPercent,
          previousVal: this.previousSimStatus.gearExtendedPercent,
        },
        {
          key: "flapPosition",
          label: "Flap position",
          configured: event.conditions?.flapPosition?.value !== null,
          modifier: event.conditions?.flapPosition?.modifier,
          value: event.conditions?.flapPosition?.value,
          currentVal: this.latestSimStatus.flapsLeftPercent,
          previousVal: this.previousSimStatus.flapsLeftPercent,
        },
      ] as const;

      for (const cond of simpleConditions) {
        if (
          !satisfied.has(cond.key) &&
          cond.configured &&
          this.evaluateCondition(
            cond.modifier,
            cond.value,
            cond.currentVal,
            cond.previousVal,
          )
        ) {
          satisfied.add(cond.key);
          console.log(
            `[Scheduler] ${cond.label} condition satisfied for "${event.name}"`,
          );
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
        event.conditions?.navAidDistance?.value &&
        event.conditions?.navAidDistance?.text &&
        currentPosition &&
        previousPosition &&
        this.airportsData[event.conditions.navAidDistance.text]
      ) {
        const navAidPosition =
          this.airportsData[event.conditions.navAidDistance.text];
        if (
          this.navAidDistanceChecker.evaluate(
            event.conditions.navAidDistance.modifier,
            event.conditions.navAidDistance.value,
            navAidPosition,
            currentPosition,
            previousPosition,
          )
        ) {
          satisfied.add("navAidDistance");
          console.log(
            `[Scheduler] NavAid distance condition satisfied for "${event.name}"`,
          );
        }
      }

      this.scenarioConditionsMet.set(event.name, satisfied);

      const allSatisfied = satisfied.size === 6;
      if (allSatisfied) {
        console.log(
          `[Scheduler] All conditions satisfied for "${event.name}", activating event`,
        );

        const trigger = () => {
          if (!this.aircraftEventHandler) {
            console.error(
              "No aircraft event handler available when trying to trigger event",
            );
            return;
          }
          this.aircraftEventHandler.activateEvent(event.name);
          this.eventStatuses.set(event.name, "triggered");
        }

        setTimeout(
          trigger,
          event.delaySeconds ? event.delaySeconds * 1000 : 0,
        );

        nextScenarios = nextScenarios.filter((s) => s !== event);
        this.scenarioConditionsMet.delete(event.name);
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
      this.eventStatuses.set(e.name, "armed");
      const initialSatisfied = new Set<string>();
      // Pre-satisfy conditions that have no value configured
      for (const s of Object.keys(CONDITION_LABELS)) {
        const key = s as ConditionKey;
        const eventConditions = e.conditions;
        if (!eventConditions[key]?.value) {
          initialSatisfied.add(key);
        }
      }
      console.log(
        `Initial satisfied conditions for "${e.name}":`,
        Array.from(initialSatisfied),
      );
      this.scenarioConditionsMet.set(e.name, initialSatisfied);
    }
  }

  public async startScenario(): Promise<void> {
    console.log("Starting scenario activation");
    if (!this.aircraftName || !this.events || this.events.length === 0) {
      console.warn("No scenarios to activate");
      return;
    }

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

    this.aircraftEventHandler = getAircraftEventHandler(
      this.aircraftName,
      this.simConnectManager.getHandle()!,
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
    this.events = [];
    this.scenarioConditionsMet = new Map();
    this.eventStatuses = new Map();
    this.airportsData = {};
  }

  public getEventStatuses(): Record<string, "armed" | "triggered"> {
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
