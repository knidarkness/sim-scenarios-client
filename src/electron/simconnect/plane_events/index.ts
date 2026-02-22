import { SimConnectConnection } from "node-simconnect";
import { PMDG737CommandHandler } from "./pmdg737handler";
import { PlaneEventHandler } from "./types";
import { BlackSquareBaron58Handler } from "./blacksquareBaron58Handler";

export function getAircraftEventHandler(
  aircraft: string,
  simConnectConnection: SimConnectConnection,
  handlerOptions?: Record<string, any>,
): PlaneEventHandler | null {
  switch (aircraft) {
    case "PMDG73X":
      return new PMDG737CommandHandler(simConnectConnection);
    case "Blacksquare Baron 58":
      return new BlackSquareBaron58Handler(simConnectConnection, handlerOptions);
    default:
      console.warn(`No event handler found for aircraft: ${aircraft}`);
      return null;
  }
}
