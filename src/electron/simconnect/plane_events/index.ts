import { SimConnectConnection } from "node-simconnect";
import { PMDG737CommandHandler } from "./pmdg737handler";
import { AircraftEventsList, PlaneEventHandler } from "./types";
import { BlackSquareBaron58Handler } from "./blacksquareBaron58Handler";
import { PMDG777CommandHandler } from "./pmdg777handler";
import { BlackSquareBonanzaB36Handler } from "./blacksquareBonanzaHandler";
import { BlackSquareBonanzaB36TurbineHandler } from "./blacksquareBonanzaTurbineHandler";
import { BlackSquareStarshipHandler } from "./blacksquareStarshipHandler";
import { FenixA320Handler } from "./fenixA320Handler";

export function getAircraftEventHandler(
  aircraft: string,
  simConnectConnection: SimConnectConnection,
  availableEvents: AircraftEventsList[],
  handlerOptions?: Record<string, any>,
): PlaneEventHandler | null {
  switch (aircraft) {
    case "Fenix A320":
      return new FenixA320Handler(availableEvents, handlerOptions);
    case "PMDG777":
      return new PMDG777CommandHandler(simConnectConnection, availableEvents);
    case "PMDG73X":
      return new PMDG737CommandHandler(simConnectConnection, availableEvents);
    case "Blacksquare Starship":
      return new BlackSquareStarshipHandler(simConnectConnection, availableEvents, handlerOptions);
    case "Blacksquare Baron 58":
      return new BlackSquareBaron58Handler(simConnectConnection, availableEvents, handlerOptions);
    case "Blacksquare Bonanza B36":
      return new BlackSquareBonanzaB36Handler(simConnectConnection, availableEvents, handlerOptions);
    case "Blacksquare Bonanza B36 (Turbine)":
      return new BlackSquareBonanzaB36TurbineHandler(simConnectConnection, availableEvents, handlerOptions);
    default:
      console.warn(`No event handler found for aircraft: ${aircraft}`);
      return null;
  }
}
