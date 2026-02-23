export const DEFINITION_ID_ALTITUDE = 1;
export const REQUEST_ID_ALTITUDE = 1;
export const NOTIFICATION_PRIORITY_HIGHEST = 1;

const PMDG737_THIRD_PARTY_EVENT_ID_MIN = 69632;
const PMDG777_THIRD_PARTY_EVENT_ID_MIN = 69632;

export interface EventMapEntry {
	clientEventId: number;
	simEventName: string;
}

const PMDG777_CDU_C_L1 = PMDG777_THIRD_PARTY_EVENT_ID_MIN + 653;
const PMDG777_CDU_C_EVENT_OFFSET = PMDG777_CDU_C_L1 - (PMDG777_THIRD_PARTY_EVENT_ID_MIN + 328);

export const PMDG_777_EVENT_MAP_CDU_C = {
	CDU_C_L1: {
		clientEventId: 3101,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 653}`,
	},
	CDU_C_L2: {
		clientEventId: 3102,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 329 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_L3: {
		clientEventId: 3103,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 330 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_L4: {
		clientEventId: 3104,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 331 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_L5: {
		clientEventId: 3105,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 332 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_L6: {
		clientEventId: 3106,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 333 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R1: {
		clientEventId: 3107,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 334 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R2: {
		clientEventId: 3108,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 335 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R3: {
		clientEventId: 3109,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 336 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R4: {
		clientEventId: 3110,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 337 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R5: {
		clientEventId: 3111,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 338 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_R6: {
		clientEventId: 3112,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 339 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_EXEC: {
		clientEventId: 3113,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 349 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_MENU: {
		clientEventId: 3114,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 350 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_PREV_PAGE: {
		clientEventId: 3115,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 352 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
	CDU_C_NEXT_PAGE: {
		clientEventId: 3116,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 353 + PMDG777_CDU_C_EVENT_OFFSET}`,
	},
} as const;


export const PMDG_737_EVENT_MAP = {
	CDU_R_L1: {
		clientEventId: 2001,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 606}`,
	},
	CDU_R_L2: {
		clientEventId: 2002,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 607}`,
	},
	CDU_R_L3: {
		clientEventId: 2003,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 608}`,
	},
	CDU_R_L4: {
		clientEventId: 2004,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 609}`,
	},
	CDU_R_L5: {
		clientEventId: 2005,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 610}`,
	},
	CDU_R_L6: {
		clientEventId: 2006,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 611}`,
	},
	CDU_R_R1: {
		clientEventId: 2007,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 612}`,
	},
	CDU_R_R2: {
		clientEventId: 2008,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 613}`,
	},
	CDU_R_R3: {
		clientEventId: 2009,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 614}`,
	},
	CDU_R_R4: {
		clientEventId: 2010,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 615}`,
	},
	CDU_R_R5: {
		clientEventId: 2011,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 616}`,
	},
	CDU_R_R6: {
		clientEventId: 2012,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 617}`,
	},
	CDU_R_EXEC: {
		clientEventId: 2013,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 628}`,
	},
	CDU_R_MENU: {
		clientEventId: 2014,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 623}`,
	},
	CDU_R_PREV_PAGE: {
		clientEventId: 2015,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 631}`,
	},
	CDU_R_NEXT_PAGE: {
		clientEventId: 2016,
		simEventName: `#${PMDG737_THIRD_PARTY_EVENT_ID_MIN + 632}`,
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
