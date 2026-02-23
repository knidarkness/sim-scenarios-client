import { SimConnectConnection } from "node-simconnect";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareBonanzaB36Handler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, handlerOptions?: Record<string, any>) {
    super("Blacksquare Bonanza B36", simConnectConnection, handlerOptions);
  }
}
