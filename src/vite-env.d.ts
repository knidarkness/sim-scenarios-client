/// <reference types="vite/client" />

// import { ActiveScenarioResponse } from "./types";

interface Window {
	simconnect: {
    setScenarios(scenarios: any): unknown;
	activateScenarios(): Promise<unknown>;
	clearScenarios(): unknown;
	};
}
