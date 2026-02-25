import { AircraftEvent, AircraftEventsList, PlaneEventHandler } from "./types";

export class FenixA320Handler implements PlaneEventHandler {
    private fenixApiURL = "http://localhost:8083";
    private availableEvents: AircraftEvent[] = [];

  constructor(
    availableEvents: AircraftEventsList[],
    handlerOptions?: Record<string, any>,
  ) {
    console.log(
      "Initializing Fenix A320 Handler with options:",
      handlerOptions,
    );
    this.fenixApiURL = handlerOptions?.fenixApiURL || this.fenixApiURL;
    this.availableEvents = availableEvents
      .find((a) => a.aircraft === "Fenix A320")!
      .categories.flatMap((c) => c.events);
  }

  public activateEvent(eventName: string): void {
    console.log(`Activating event ${eventName} for Fenix A320`);
    const event = this.availableEvents.find((e) => e.name === eventName);
    if (!event) {
      console.warn(`Event ${eventName} not found for Fenix A320`);
      return;
    }
    console.log(`Event details:`, event);

    fetch(`${this.fenixApiURL}/fenix/failures/saveManual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        title: event.name,
        failureCondition: null,
        failed: true,
        displayTitle: event.name,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(`saveManual response:`, data))
      .catch((err) => console.error(`saveManual error:`, err));
  }
  stop(): void {
    
  }
  start(): void {
    
  }
}
