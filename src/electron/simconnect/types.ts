export const DEFINITION_ID_ALTITUDE = 1;
export const REQUEST_ID_ALTITUDE = 1;
export const NOTIFICATION_PRIORITY_HIGHEST = 1;

export interface EventMapEntry {
	clientEventId: number;
	simEventName: string;
}

export type ScenarioConditionModifier = 'Equals' | 'Descending through' | 'Increasing through' | null;

export interface ScenarioCondition {
	modifier: ScenarioConditionModifier;
	value: string | null;
}

export interface ScenarioConditions {
	altitude: ScenarioCondition;
	speed: ScenarioCondition;
	landingGear: ScenarioCondition;
	flapPosition: ScenarioCondition;
}

export interface ActiveScenarioItem {
	name: string;
	isActive: boolean;
	conditions: ScenarioConditions;
}

export interface ActiveScenarioData {
	_id: string;
	scenarios: ActiveScenarioItem[];
	aircraft: string;
	token: string;
	user: string;
}

export interface ActiveScenarioResponse {
	activeScenario: ActiveScenarioData;
}
