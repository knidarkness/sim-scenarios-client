import {
  EventFlag,
  open,
  Protocol,
  SimConnectConnection,
} from "node-simconnect";
import { EVENT_MAP, NOTIFICATION_PRIORITY_HIGHEST } from "./types.js";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

type SimStatus {
    altitudeFeet: number | null;
    airspeedKts: number | null;
}

export class EventScheduler {
  private static instance: EventScheduler | null = null;

  private simconnect: SimConnectConnection | null = null;

  private constructor() {}

  static getInstance(): EventScheduler {
    if (!EventScheduler.instance) {
      EventScheduler.instance = new EventScheduler();
    }

    return EventScheduler.instance;
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
    console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

    handle.on("exception", (exception: unknown) => {
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

  public close() {
    if (this.simconnect) {
      this.simconnect.close();
      this.simconnect = null;
      console.log("[SimConnect] Connection closed");
    }
  }
}
