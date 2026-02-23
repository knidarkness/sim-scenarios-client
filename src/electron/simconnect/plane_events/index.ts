import { SimConnectConnection } from "node-simconnect";
import { PMDG737CommandHandler } from "./pmdg737handler";
import { PlaneEventHandler } from "./types";
import { BlackSquareBaron58Handler } from "./blacksquareBaron58Handler";
import { PMDG777CommandHandler } from "./pmdg777handler";
import { BlackSquareBonanzaB36Handler } from "./blacksquareBonanzaHandler";
import { BlackSquareBonanzaB36TurbineHandler } from "./blacksquareBonanzaTurbineHandler";

export function getAircraftEventHandler(
  aircraft: string,
  simConnectConnection: SimConnectConnection,
  handlerOptions?: Record<string, any>,
): PlaneEventHandler | null {
  switch (aircraft) {
    case "PMDG777":
      return new PMDG777CommandHandler(simConnectConnection);
    case "PMDG73X":
      return new PMDG737CommandHandler(simConnectConnection);
    case "Blacksquare Baron 58":
      return new BlackSquareBaron58Handler(simConnectConnection, handlerOptions);
    case "Blacksquare Bonanza B36":
      return new BlackSquareBonanzaB36Handler(simConnectConnection, handlerOptions);
    case "Blacksquare Bonanza B36 (Turbine)":
      return new BlackSquareBonanzaB36TurbineHandler(simConnectConnection, handlerOptions);
    default:
      console.warn(`No event handler found for aircraft: ${aircraft}`);
      return null;
  }
}
