import { SimConnectConnection } from "node-simconnect";
import { PlaneEventHandler } from "./types";

export class BlackSquareBaron58Handler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;

  constructor(simConnectConnection: SimConnectConnection) {
    this.simConnectConnection = simConnectConnection;
  }

  activateEvent(eventName: string): void {
    console.log("Method not implemented.");
  }

  stop(): void {
    console.log("Method not implemented.");
  }
}
