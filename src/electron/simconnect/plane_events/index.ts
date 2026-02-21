import { SimConnectConnection } from "node-simconnect";
import { PMDG737CommandHandler } from "./pmdg737handler";

export interface PlaneEventHandler {
  activateEvent(eventName: string): Promise<void>;
  stop(): void;
}

export function getAircraftEventHandler(
  aircraft: string,
  simConnectConnection: SimConnectConnection
): PlaneEventHandler | null {
  switch (aircraft) {
    case "PMDG73X":
      return new PMDG737CommandHandler(simConnectConnection);
    default:
      console.warn(`No event handler found for aircraft: ${aircraft}`);
      return null;
  }
}