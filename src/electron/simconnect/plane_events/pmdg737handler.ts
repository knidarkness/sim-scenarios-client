import { EventFlag, SimConnectConnection } from "node-simconnect";
import { PMDG_737_EVENT_MAP, EventMapEntry, NOTIFICATION_PRIORITY_HIGHEST } from "../types";
import { getFaultPathForEvent } from "../simconnect_events";
import { PlaneEventHandler } from "./types";

export class PMDG737CommandHandler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;

  private inputEventQueue: EventMapEntry[] = [];
  private inputEventIntervalHandle: NodeJS.Timeout | null = null;

  constructor(simConnectConnection: SimConnectConnection) {
    this.simConnectConnection = simConnectConnection;
    this.registerMappedEvents(simConnectConnection);
  }

  private registerMappedEvents(handle: SimConnectConnection): void {
    const eventDefinitions = Object.values(PMDG_737_EVENT_MAP) as Array<
      (typeof PMDG_737_EVENT_MAP)[keyof typeof PMDG_737_EVENT_MAP]
    >;

    eventDefinitions.forEach((eventDefinition) => {
      handle.mapClientEventToSimEvent(
        eventDefinition.clientEventId,
        eventDefinition.simEventName,
      );
    });
  }

  public activateEvent(eventName: string): void {
    const inputs = getFaultPathForEvent("PMDG73X", eventName);
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
