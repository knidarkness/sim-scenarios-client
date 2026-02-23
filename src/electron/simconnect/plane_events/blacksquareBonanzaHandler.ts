import { SimConnectConnection } from "node-simconnect";
import { AircraftEventsList } from "./types";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareBonanzaB36Handler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, availableEvents: AircraftEventsList[], handlerOptions?: Record<string, any>) {
    super("Blacksquare Bonanza B36", simConnectConnection, availableEvents, handlerOptions);
  }
}
