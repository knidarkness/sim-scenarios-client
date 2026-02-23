import { SimConnectConnection } from "node-simconnect";
import { AircraftEventsList } from "./types";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareBaron58Handler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, availableEvents: AircraftEventsList[], handlerOptions?: Record<string, any>) {
    super("Blacksquare Baron 58", simConnectConnection, availableEvents, handlerOptions);
  }
}
