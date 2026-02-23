export type ScenarioConditionModifier = 'Equals' | 'Descending through' | 'Increasing through' | null;

export interface ScenarioCondition {
	modifier: ScenarioConditionModifier;
	value: string | null;
}

export interface ScenarioConditions {
	altitude: ScenarioCondition;
	speed: ScenarioCondition;
}

export interface ActiveScenarioItem {
	name: string;
	isActive: boolean;
	conditions: ScenarioConditions;
}

export interface ActiveScenarioData {
	_id: string;
	scenarios: ActiveScenarioItem[];
	token: string;
	user: string;
	aircraft: string;
}

export interface ActiveScenarioResponse {
	activeScenario: ActiveScenarioData;
}
