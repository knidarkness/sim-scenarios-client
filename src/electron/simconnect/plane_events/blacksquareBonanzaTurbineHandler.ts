import { SimConnectConnection } from "node-simconnect";
import { BlackSquareBaseHandler } from "./blacksquareBaseHandler";

export class BlackSquareBonanzaB36TurbineHandler extends BlackSquareBaseHandler {
  constructor(simConnectConnection: SimConnectConnection, handlerOptions?: Record<string, any>) {
    super("Blacksquare Bonanza B36 (Turbine)", simConnectConnection, handlerOptions);
  }
}
