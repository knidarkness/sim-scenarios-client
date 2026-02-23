/// <reference types="vite/client" />

// import { ActiveScenarioResponse } from "./types";

interface Window {
	simconnect: {
    getAppVersion(): Promise<string>;
    setScenarios(scenarios: any): unknown;
	activateScenarios(): Promise<unknown>;
	clearScenarios(): unknown;
	setAircraftHandlerOptions(options: Record<string, any>): unknown;
	setAvailableEvents(events: any[]): unknown;
	};
}
