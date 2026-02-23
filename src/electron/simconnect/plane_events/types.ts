export interface PlaneEventHandler {
  activateEvent(eventName: string): void;
  stop(): void;
  start(): void;
}

export type AircraftEventsList = {
  aircraft: string;
  categories: EventCategory[];
};

export type EventCategory = {
  name: string;
  events: string[];
};