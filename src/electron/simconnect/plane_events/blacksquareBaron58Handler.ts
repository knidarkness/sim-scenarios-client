import { SimConnectConnection } from "node-simconnect";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareBaron58Handler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, handlerOptions?: Record<string, any>) {
    super("Blacksquare Baron 58", simConnectConnection, handlerOptions);
  }
}
