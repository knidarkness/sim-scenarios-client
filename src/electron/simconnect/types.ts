export const DEFINITION_ID_ALTITUDE = 1;
export const REQUEST_ID_ALTITUDE = 1;
export const NOTIFICATION_PRIORITY_HIGHEST = 1;

const THIRD_PARTY_EVENT_ID_MIN = 69632;

export interface EventMapEntry {
	clientEventId: number;
	simEventName: string;
}

export const EVENT_MAP = {
	LOGO_LIGHT_SWITCH: {
		clientEventId: 1001,
		simEventName: "#69754",
	},
	CDU_R_L1: {
		clientEventId: 2001,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 606}`,
	},
	CDU_R_L2: {
		clientEventId: 2002,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 607}`,
	},
	CDU_R_L3: {
		clientEventId: 2003,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 608}`,
	},
	CDU_R_L4: {
		clientEventId: 2004,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 609}`,
	},
	CDU_R_L5: {
		clientEventId: 2005,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 610}`,
	},
	CDU_R_L6: {
		clientEventId: 2006,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 611}`,
	},
	CDU_R_R1: {
		clientEventId: 2007,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 612}`,
	},
	CDU_R_R2: {
		clientEventId: 2008,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 613}`,
	},
	CDU_R_R3: {
		clientEventId: 2009,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 614}`,
	},
	CDU_R_R4: {
		clientEventId: 2010,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 615}`,
	},
	CDU_R_R5: {
		clientEventId: 2011,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 616}`,
	},
	CDU_R_R6: {
		clientEventId: 2012,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 617}`,
	},
	CDU_R_EXEC: {
		clientEventId: 2013,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 628}`,
	},
	CDU_R_MENU: {
		clientEventId: 2014,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 623}`,
	},
	CDU_R_PREV_PAGE: {
		clientEventId: 2015,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 631}`,
	},
	CDU_R_NEXT_PAGE: {
		clientEventId: 2016,
		simEventName: `#${THIRD_PARTY_EVENT_ID_MIN + 632}`,
	},
} as const;

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
}

export interface ActiveScenarioResponse {
	activeScenario: ActiveScenarioData;
}
