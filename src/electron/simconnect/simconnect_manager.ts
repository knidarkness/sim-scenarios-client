import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectConnection,
  SimConnectDataType,
  SimConnectPeriod,
  FacilityDataType,
} from "node-simconnect";

const DEFINITION_ID_SIM_STATUS = 9001;
const REQUEST_ID_SIM_STATUS = 9001;

const DEFINITION_ID_FACILITY_AIRPORT = 9020;
const REQUEST_ID_AIRPORT_DATA_START = 9100;

export type SimStatus = {
  latitude: number | null;
  longitude: number | null;
  altitudeFeet: number | null;
  altAboveGroundFeet: number | null;
  airspeedKts: number | null;
  gearExtendedPercent: number | null;
  flapsLeftPercent: number | null;
};

export function emptySimStatus(): SimStatus {
  return {
    latitude: null,
    longitude: null,
    altitudeFeet: null,
    altAboveGroundFeet: null,
    airspeedKts: null,
    gearExtendedPercent: null,
    flapsLeftPercent: null,
  };
}

export type SimConnectCallbacks = {
  onSimStatus: (status: SimStatus) => void;
  onAirportData: (
    icao: string,
    data: { lat: number; lon: number; alt: number },
  ) => void;
  onDisconnect: () => void;
};

export class SimConnectManager {
  private handle: SimConnectConnection | null = null;

  public isConnected(): boolean {
    return this.handle !== null;
  }

  public getHandle(): SimConnectConnection | null {
    return this.handle;
  }

  public async connect(
    icaos: string[],
    callbacks: SimConnectCallbacks,
  ): Promise<void> {
    const { recvOpen, handle } = await open(
      "Sim Scenarios Electron",
      Protocol.KittyHawk,
    );
    this.handle = handle;

    this.setupSimStatusMonitoring(handle, callbacks.onSimStatus);
    this.setupAirportDataFetching(handle, icaos, callbacks.onAirportData);

    console.log(`[SimConnect] Connected to ${recvOpen.applicationName}`);

    handle.on("exception", (exception: unknown) => {
      console.error("[SimConnect] Exception:", exception);
    });

    handle.on("quit", () => {
      console.log("[SimConnect] Simulator quit");
      this.close();
      callbacks.onDisconnect();
    });

    handle.on("close", () => {
      console.log("[SimConnect] Connection closed");
      this.close();
      callbacks.onDisconnect();
    });
  }

  public close(): void {
    if (!this.handle) {
      return;
    }
    try {
      this.handle.close();
    } catch (error) {
      console.error("[SimConnect] Error while closing connection:", error);
    }
    this.handle = null;
  }

  private setupSimStatusMonitoring(
    handle: SimConnectConnection,
    onSimStatus: (status: SimStatus) => void,
  ): void {
    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "PLANE LATITUDE",
      "degrees",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "PLANE LONGITUDE",
      "degrees",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "PLANE ALTITUDE",
      "feet",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "PLANE ALT ABOVE GROUND",
      "feet",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "AIRSPEED INDICATED",
      "knots",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "GEAR TOTAL PCT EXTENDED",
      "percent",
      SimConnectDataType.FLOAT64,
    );

    handle.addToDataDefinition(
      DEFINITION_ID_SIM_STATUS,
      "TRAILING EDGE FLAPS LEFT PERCENT",
      "percent",
      SimConnectDataType.FLOAT64,
    );

    handle.requestDataOnSimObject(
      REQUEST_ID_SIM_STATUS,
      DEFINITION_ID_SIM_STATUS,
      SimConnectConstants.OBJECT_ID_USER,
      SimConnectPeriod.SECOND,
    );

    handle.on("simObjectData", (packet: any) => {
      if (packet.requestID !== REQUEST_ID_SIM_STATUS) {
        return;
      }

      const latitude = packet.data.readFloat64();
      const longitude = packet.data.readFloat64();
      const altitudeFeet = packet.data.readFloat64();
      const altAboveGroundFeet = packet.data.readFloat64();
      const airspeedKts = packet.data.readFloat64();
      const gearExtendedPercent = packet.data.readFloat64();
      const flapsLeftPercent = packet.data.readFloat64();

      console.log({
        latitude,
        longitude,
        altitudeFeet,
        altAboveGroundFeet,
        airspeedKts,
        gearExtendedPercent,
        flapsLeftPercent,
      });

      onSimStatus({
        latitude,
        longitude,
        altitudeFeet,
        altAboveGroundFeet,
        airspeedKts,
        gearExtendedPercent,
        flapsLeftPercent,
      });
    });
  }

  private setupAirportDataFetching(
    handle: SimConnectConnection,
    icaos: string[],
    onAirportData: (
      icao: string,
      data: { lat: number; lon: number; alt: number },
    ) => void,
  ): void {
    handle.addToFacilityDefinition(
      DEFINITION_ID_FACILITY_AIRPORT,
      "OPEN AIRPORT",
    );
    handle.addToFacilityDefinition(DEFINITION_ID_FACILITY_AIRPORT, "LATITUDE");
    handle.addToFacilityDefinition(DEFINITION_ID_FACILITY_AIRPORT, "LONGITUDE");
    handle.addToFacilityDefinition(DEFINITION_ID_FACILITY_AIRPORT, "ALTITUDE");
    handle.addToFacilityDefinition(DEFINITION_ID_FACILITY_AIRPORT, "ICAO");
    handle.addToFacilityDefinition(
      DEFINITION_ID_FACILITY_AIRPORT,
      "CLOSE AIRPORT",
    );

    for (const icao of icaos) {
      handle.requestFacilityData(
        DEFINITION_ID_FACILITY_AIRPORT,
        REQUEST_ID_AIRPORT_DATA_START,
        icao,
      );
    }

    handle.on("facilityData", (packet: any) => {
      switch (packet.type) {
        case FacilityDataType.AIRPORT: {
          const lat = packet.data.readFloat64();
          const lon = packet.data.readFloat64();
          const alt = packet.data.readFloat64();
          const icao = packet.data.readString8();
          console.log(
            `[Facilities] Airport lat=${lat}, lon=${lon}, alt=${alt}, ICAO=${icao}`,
          );
          onAirportData(icao, { lat, lon, alt });
          break;
        }
        default:
          console.warn(`Unknown facility data type: ${packet.type}`);
      }
    });
  }
}
