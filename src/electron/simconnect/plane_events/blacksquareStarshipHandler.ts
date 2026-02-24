import { SimConnectConnection } from "node-simconnect";
import { AircraftEventsList } from "./types";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareStarshipHandler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, availableEvents: AircraftEventsList[], handlerOptions?: Record<string, any>) {
    super("Blacksquare Starship", simConnectConnection, availableEvents, handlerOptions);
  }
}
