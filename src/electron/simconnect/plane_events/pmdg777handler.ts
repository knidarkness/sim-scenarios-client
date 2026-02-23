import { EventFlag, SimConnectConnection } from "node-simconnect";
import { PMDG_777_EVENT_MAP_CDU_C, EventMapEntry, NOTIFICATION_PRIORITY_HIGHEST } from "../types";
import { PlaneEventHandler } from "./types";
import { availableEvents } from "./types";

export class PMDG777CommandHandler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;

  private inputEventQueue: EventMapEntry[] = [];
  private inputEventIntervalHandle: NodeJS.Timeout | null = null;

  constructor(simConnectConnection: SimConnectConnection) {
    this.simConnectConnection = simConnectConnection;
    this.registerMappedEvents(simConnectConnection);
    console.log("PMDG777CommandHandler initialized");
  }

  private registerMappedEvents(handle: SimConnectConnection): void {
    const eventDefinitions = Object.values(PMDG_777_EVENT_MAP_CDU_C) as Array<
      (typeof PMDG_777_EVENT_MAP_CDU_C)[keyof typeof PMDG_777_EVENT_MAP_CDU_C]
    >;

    eventDefinitions.forEach((eventDefinition) => {
      handle.mapClientEventToSimEvent(
        eventDefinition.clientEventId,
        eventDefinition.simEventName,
      );
    });
  }

  public activateEvent(eventName: string): void {
    const inputs = getFaultPathForEvent("PMDG777", eventName);
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
}

function getFaultPathForEvent(aircraft: string, eventName: string): EventMapEntry[] | null {
    const LSK_ROWS = [
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L2,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L3,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L4,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L5,
    ]

    const FAULTS_PER_PAGE = 5;
    const allEvents = availableEvents.filter(e => e.aircraft === aircraft).pop();
    if (!allEvents) {
        return null;
    }
    const eventCategory = allEvents.categories.find(c => c.events.some(e => e === eventName));
    if (!eventCategory) {
        return null;
    }
    const categoryIndex = allEvents.categories.findIndex(c => c.name === eventCategory.name);
    const categoryPageIndex = Math.floor(categoryIndex / FAULTS_PER_PAGE);
    const categoryIndexInPage = categoryIndex % FAULTS_PER_PAGE;

    const eventIndexInCategory = eventCategory.events.findIndex(e => e === eventName);
    if (eventIndexInCategory === -1) {
        return null;
    }
    const pageIndex = Math.floor(eventIndexInCategory / FAULTS_PER_PAGE);
    const indexInPage = eventIndexInCategory % FAULTS_PER_PAGE;
    console.log(`Event: ${eventName}, Category: ${eventCategory.name}, Category Page: ${categoryPageIndex}, Category Index in Page: ${categoryIndexInPage}, Event Page: ${pageIndex}, Event Index in Page: ${indexInPage}`);
    
    const commandsToFault: EventMapEntry[] = [
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_MENU, // Exit to menu
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_R5, // Enter PMDG Setup,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1, // Select Aircraft
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L3, // Select Faults
        ...Array(categoryPageIndex).fill(PMDG_777_EVENT_MAP_CDU_C.CDU_C_NEXT_PAGE),
        LSK_ROWS[categoryIndexInPage],
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1, // Select programmed
        ...Array(pageIndex).fill(PMDG_777_EVENT_MAP_CDU_C.CDU_C_NEXT_PAGE),
        LSK_ROWS[indexInPage],
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1, // Activate
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_EXEC, // Execute
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_MENU, // Exit to menu
    ];
    return commandsToFault;
}
