import { SimConnectConnection } from "node-simconnect";
import { availableEvents, PlaneEventHandler } from "./types";
import WebSocket from "ws";

export class BlackSquareBonanzaB36TurbineHandler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;
  availableEvents: string[] = [];
  ws: WebSocket | null = null;
  wsAddress: string = "ws://localhost:2048/fsuipc/";

  constructor(simConnectConnection: SimConnectConnection, handlerOptions?: Record<string, any>) {
    this.simConnectConnection = simConnectConnection;
    this.availableEvents = availableEvents
      .find((a) => a.aircraft === "Blacksquare Bonanza B36 (Turbine)")!
      .categories.flatMap((c) => c.events);
    if (handlerOptions?.wsAddress) {
      this.wsAddress = handlerOptions.wsAddress;
    }
  }

  activateEvent(eventName: string): void {
    const calcCode = this.getSimEventFSUIPCCalcCode(eventName);
    if (!calcCode) {
      console.warn(`No sim event name found for scenario event: ${eventName}`);
      return;
    }
    console.log(`Activating sim event: ${calcCode}`);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(
        `WebSocket is not open. Cannot activate event: ${eventName}`,
      );
      return;
    }
    const wsRequest = {
      command: "vars.calc",
      name: calcCode,
      code: calcCode,
    };
    this.ws.send(JSON.stringify(wsRequest));
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  start(): void {
    console.log("will start websocket connection for Bonanza B36 (Turbine) event handler");
    this.ws = new WebSocket(this.wsAddress, "fsuipc");
    this.ws.onopen = async () => {
      console.log(
        "WebSocket connection established for Bonanza B36 (Turbine) event handler",
      );
    };
    this.ws.onmessage = (event) => {
      console.log("Received message from WebSocket:", event.data);
    };
  }

  stop(): void {
    this.ws?.close();
    this.ws = null;
  }

  private getSimEventFSUIPCCalcCode(eventName: string): string | null {
    const eventEntry = this.availableEvents.find(
      (event) => event === eventName,
    );

    if (!eventEntry) {
      console.warn(`No event entry found for event name: ${eventName}`);
      return null;
    }

    const simEventName = `(>H:BKSQ_FAILURE_${eventName.toUpperCase().replace(/ /g, "_")})`;
    console.log(
      `Mapped scenario event "${eventName}" to sim event "${simEventName}"`,
    );

    return simEventName;
  }
}
