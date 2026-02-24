export interface PlaneEventHandler {
  activateEvent(eventName: string): void;
  stop(): void;
  start(): void;
}

export type AircraftEvent = {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  severity?: number;
};

export type AircraftEventsList = {
  aircraft: string;
  categories: EventCategory[];
};

export type EventCategory = {
  name: string;
  events: AircraftEvent[];
};