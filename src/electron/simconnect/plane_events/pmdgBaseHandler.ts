import { EventFlag, SimConnectConnection } from "node-simconnect";
import {
  EventMapEntry,
  NOTIFICATION_PRIORITY_HIGHEST,
} from "../types";
import { availableEvents, PlaneEventHandler } from "./types";

export interface PMDGHandlerConfig {
  aircraft: string;
  eventMap: Record<string, EventMapEntry>;
  lskRows: EventMapEntry[];
  navigateToFaults: EventMapEntry[];
  nextPage: EventMapEntry;
  selectProgrammed: EventMapEntry;
  activate: EventMapEntry;
  execute: EventMapEntry;
  exitMenu: EventMapEntry;
  faultsPerPage?: number;
  handlerName?: string;
}

export abstract class PMDGBaseCommandHandler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;

  private inputEventQueue: EventMapEntry[] = [];
  private inputEventIntervalHandle: NodeJS.Timeout | null = null;
  private readonly config: PMDGHandlerConfig;

  constructor(
    simConnectConnection: SimConnectConnection,
    config: PMDGHandlerConfig,
  ) {
    this.simConnectConnection = simConnectConnection;
    this.config = config;
    this.registerMappedEvents(simConnectConnection);
    if (this.config.handlerName) {
      console.log(`${this.config.handlerName} initialized`);
    }
  }

  private registerMappedEvents(handle: SimConnectConnection): void {
    const eventDefinitions = Object.values(this.config.eventMap);

    eventDefinitions.forEach((eventDefinition) => {
      handle.mapClientEventToSimEvent(
        eventDefinition.clientEventId,
        eventDefinition.simEventName,
      );
    });
  }

  public activateEvent(eventName: string): void {
    const inputs = this.getFaultPathForEvent(eventName);
    if (!inputs) {
      console.warn(`No mapped events found for scenario: ${eventName}`);
      return;
    }

    console.log(inputs);
    if (!this.inputEventIntervalHandle) {
      this.start();
    }
    this.inputEventQueue.push(...inputs);
    console.log(`Activating event for scenario: ${eventName}`);
  }

  public start() {
    this.inputEventIntervalHandle = setInterval(() => {
      if (!this.simConnectConnection || this.inputEventQueue.length === 0) {
        return;
      }
      const event = this.inputEventQueue.shift();
      if (event) {
        this.sendSimConnectEvent(event.clientEventId);
      }
    }, 1000);
  }

  public stop() {
    if (this.inputEventIntervalHandle) {
      clearInterval(this.inputEventIntervalHandle);
      this.inputEventIntervalHandle = null;
      this.inputEventQueue = [];
    }
  }

  private sendSimConnectEvent(eventID: number): void {
    if (!this.simConnectConnection) {
      throw new Error("SimConnect is not connected");
    }

    this.simConnectConnection.transmitClientEvent(
      0,
      eventID,
      1,
      NOTIFICATION_PRIORITY_HIGHEST,
      EventFlag.EVENT_FLAG_GROUPID_IS_PRIORITY,
    );
  }

  private getFaultPathForEvent(eventName: string): EventMapEntry[] | null {
    const faultsPerPage = this.config.faultsPerPage ?? 5;
    const allEvents = availableEvents.find(
      (eventEntry) => eventEntry.aircraft === this.config.aircraft,
    );
    if (!allEvents) {
      return null;
    }

    const eventCategory = allEvents.categories.find((category) =>
      category.events.some((event) => event === eventName),
    );
    if (!eventCategory) {
      return null;
    }

    const categoryIndex = allEvents.categories.findIndex(
      (category) => category.name === eventCategory.name,
    );
    const categoryPageIndex = Math.floor(categoryIndex / faultsPerPage);
    const categoryIndexInPage = categoryIndex % faultsPerPage;

    const eventIndexInCategory = eventCategory.events.findIndex(
      (event) => event === eventName,
    );
    if (eventIndexInCategory === -1) {
      return null;
    }

    const pageIndex = Math.floor(eventIndexInCategory / faultsPerPage);
    const indexInPage = eventIndexInCategory % faultsPerPage;
    console.log(
      `Event: ${eventName}, Category: ${eventCategory.name}, Category Page: ${categoryPageIndex}, Category Index in Page: ${categoryIndexInPage}, Event Page: ${pageIndex}, Event Index in Page: ${indexInPage}`,
    );

    const commandsToFault: EventMapEntry[] = [
      ...this.config.navigateToFaults,
      ...Array(categoryPageIndex).fill(this.config.nextPage),
      this.config.lskRows[categoryIndexInPage],
      this.config.selectProgrammed,
      ...Array(pageIndex).fill(this.config.nextPage),
      this.config.lskRows[indexInPage],
      this.config.activate,
      this.config.execute,
      this.config.exitMenu,
    ];

    return commandsToFault;
  }
}