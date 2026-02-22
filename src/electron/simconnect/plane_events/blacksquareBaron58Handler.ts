import { SimConnectConnection } from "node-simconnect";
import { PlaneEventHandler } from "./types";
import WebSocket from "ws";

export class BlackSquareBaron58Handler implements PlaneEventHandler {
  simConnectConnection: SimConnectConnection;
  availableEvents: string[] = [];
  ws: WebSocket | null = null;
  wsAddress: string = "ws://localhost:2048/fsuipc/";

  constructor(simConnectConnection: SimConnectConnection, handlerOptions?: Record<string, any>) {
    this.simConnectConnection = simConnectConnection;
    this.availableEvents = BLACKSQUARE_BARON58_EVENT_NAMES_FLAT;
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
    console.log("will start websocket connection for Baron 58 event handler");
    this.ws = new WebSocket(this.wsAddress, "fsuipc");
    this.ws.onopen = async () => {
      console.log(
        "WebSocket connection established for Baron 58 event handler",
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

const BLACKSQUARE_BARON58_EVENTS = {
        aircraft: "Blacksquare Baron 58",
        categories: [
            {
                name: "Engine",
                events: [
                    "L ENGINE FAILURE",
                    "R ENGINE FAILURE",
                    "L ENGINE FIRE",
                    "R ENGINE FIRE",
                    "L TURBOCHARGER",
                    "R TURBOCHARGER",
                    "L ENG DRIVEN OIL PUMP",
                    "L ENG DRIVEN FUEL PUMP",
                    "L UNFEATHERING ACCMLTR",
                    "R ENG DRIVEN OIL PUMP",
                    "R ENG DRIVEN FUEL PUMP",
                    "R UNFEATHERING ACCMLTR",
                    "L STARTER MOTOR",
                    "R STARTER MOTOR",
                    "L TACH AND FF GAUGES",
                    "R TACH AND FF GAUGES",
                    "L OIL AND CYL GAUGES",
                    "R OIL AND CYL GAUGES",
                    "ENGINE MONITOR",
                    "PROP SYNC",
                    "LOW THRUST DETECT"
                ]
            },
            {
                name: "Ignition",
                events: [
                    "L ENG L MAGNETO",
                    "L ENG R MAGNETO",
                    "L ENG L MAGNETO GROUNDING",
                    "L ENG R MAGNETO GROUNDING",
                    "L IGNITION SWITCH GROUND",
                    "R ENG L MAGNETO",
                    "R ENG R MAGNETO",
                    "R ENG L MAGNETO GROUNDING",
                    "R ENG R MAGNETO GROUNDING",
                    "R IGNITION SWITCH GROUND"
                ]
            },
            {
                name: "Electrical",
                events: [
                    "L ALTERNATOR",
                    "R ALTERNATOR",
                    "ACCESSORIES POWER",
                    "STANDBY AVIONICS",
                    "VOLTMETER",
                    "ANNUNCIATOR LIGHTS"
                ]
            },
            {
                name: "Flight Instruments",
                events: [
                    "INSTRUMENT AIR",
                    "INSTRUMENT AIR PARTIAL",
                    "PITOT BLOCKAGE",
                    "STATIC BLOCKAGE",
                    "TURN COORD",
                    "YOKE CHRONOS",
                    "STALL WARNING"
                ]
            },
            {
                name: "Fuel",
                events: [
                    "L FUEL LEAK",
                    "R FUEL LEAK",
                    "L FUEL PUMP",
                    "R FUEL PUMP",
                    "L FUEL QTY",
                    "R FUEL QTY"
                ]
            },
            {
                name: "Brakes",
                events: [
                    "L BRAKE",
                    "R BRAKE"
                ]
            },
            {
                name: "Landing Gear",
                events: [
                    "GEAR MOTOR",
                    "GEAR WARNING",
                    "LANDING GEAR POS LIGHTS"
                ]
            },
            {
                name: "Flight Controls",
                events: [
                    "FLAP MOTOR"
                ]
            },
            {
                name: "Pressurization",
                events: [
                    "CABIN SAFETY VALVE",
                    "CABIN OUTFLOW VALVE",
                    "INFLOW CONTROL UNIT",
                    "DOOR SEAL PRIMARY",
                    "DOOR SEAL STANDBY",
                    "CABIN PRESS CONTROL",
                    "DOOR SEAL PUMP"
                ]
            },
            {
                name: "Environmental",
                events: [
                    "L ENG CO LEAK",
                    "R ENG CO LEAK",
                    "CABIN HEATER CO LEAK",
                    "CO DETECTOR",
                    "COMBUSTION HEATER",
                    "CONDENSER LIMIT",
                    "VENT BLOWERS",
                    "AIR CONDITIONER",
                    "AIR CONDITIONING BLOWER",
                    "CABIN HEAT IGN",
                    "CABIN HEAT BLOWER"
                ]
            },
            {
                name: "Doors",
                events: [
                    "NOSE DOOR LATCH",
                    "PILOT DOOR LATCH",
                    "CABIN DOOR LATCH"
                ]
            },
            {
                name: "Ice Protection",
                events: [
                    "DEICE BOOTS INTEG",
                    "DEICE BOOTS",
                    "L PITOT HEAT",
                    "R PITOT HEAT",
                    "PROP HEAT",
                    "WINDSHIELD HEAT",
                    "FUEL VENT HEAT",
                    "STALL WARN HEAT"
                ]
            },
            {
                name: "Oxygen",
                events: [
                    "OXYGEN LEAK"
                ]
            },
            {
                name: "Lighting",
                events: [
                    "STROBE LIGHT",
                    "BEACON LIGHT",
                    "NAV LIGHTS",
                    "TAXI LIGHTS",
                    "L LANDING LIGHTS",
                    "R LANDING LIGHTS",
                    "WING LIGHT",
                    "PANEL LIGHTS",
                    "CABIN LIGHTS"
                ]
            },
            {
                name: "Navigation",
                events: [
                    "NAV 1",
                    "NAV 2",
                    "RNAV",
                    "ADF",
                    "HSI",
                    "DME",
                    "RADAR ALTIMETER",
                    "REMOTE COMPASS",
                    "GYRO SLAVING"
                ]
            },
            {
                name: "Communications",
                events: [
                    "COM 1",
                    "COM 2",
                    "AUDIO PANEL",
                    "TRANSPONDER"
                ]
            },
            {
                name: "Autopilot",
                events: [
                    "AUTOPILOT CONTROLLER",
                    "AUTOPILOT ACTUATORS"
                ]
            },
            {
                name: "Weather Systems",
                events: [
                    "WX RADAR CONTROLLER",
                    "WX RADAR TRANSCEIVER"
                ]
            },
            {
                name: "Miscellaneous",
                events: [
                    "ENCODER"
                ]
            }
        ]
    };

const BLACKSQUARE_BARON58_EVENT_NAMES_FLAT =
  BLACKSQUARE_BARON58_EVENTS.categories.flatMap((category) =>
    category.events.map((event) => event),
  );
