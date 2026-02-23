export const DEFINITION_ID_ALTITUDE = 1;
export const REQUEST_ID_ALTITUDE = 1;
export const NOTIFICATION_PRIORITY_HIGHEST = 1;

const PMDG737_THIRD_PARTY_EVENT_ID_MIN = 69632;
const PMDG777_THIRD_PARTY_EVENT_ID_MIN = 69632;

export interface EventMapEntry {
	clientEventId: number;
	simEventName: string;
}

// #define EVT_CDU_L_L1									(THIRD_PARTY_EVENT_ID_MIN +  328)	
// #define EVT_CDU_L_L2									(THIRD_PARTY_EVENT_ID_MIN +  329)	
// #define EVT_CDU_L_L3									(THIRD_PARTY_EVENT_ID_MIN +  330)	
// #define EVT_CDU_L_L4									(THIRD_PARTY_EVENT_ID_MIN +  331)	
// #define EVT_CDU_L_L5									(THIRD_PARTY_EVENT_ID_MIN +  332)	
// #define EVT_CDU_L_L6									(THIRD_PARTY_EVENT_ID_MIN +  333)	
// #define EVT_CDU_L_R1									(THIRD_PARTY_EVENT_ID_MIN +  334)	
// #define EVT_CDU_L_R2									(THIRD_PARTY_EVENT_ID_MIN +  335)	
// #define EVT_CDU_L_R3									(THIRD_PARTY_EVENT_ID_MIN +  336)	
// #define EVT_CDU_L_R4									(THIRD_PARTY_EVENT_ID_MIN +  337)	
// #define EVT_CDU_L_R5									(THIRD_PARTY_EVENT_ID_MIN +  338)	
// #define EVT_CDU_L_R6									(THIRD_PARTY_EVENT_ID_MIN +  339)
// #define EVT_CDU_L_EXEC								(THIRD_PARTY_EVENT_ID_MIN +  349)	
// #define EVT_CDU_L_MENU								(THIRD_PARTY_EVENT_ID_MIN +  350)
// #define EVT_CDU_L_PREV_PAGE							(THIRD_PARTY_EVENT_ID_MIN +  352)	
// #define EVT_CDU_L_NEXT_PAGE							(THIRD_PARTY_EVENT_ID_MIN +  353)	
// 
// #define EVT_CDU_C_L1									(THIRD_PARTY_EVENT_ID_MIN + 653 )
// #define CDU_EVT_OFFSET_C								(EVT_CDU_C_L1-EVT_CDU_L_L1)
// #define EVT_CDU_C_L2									(CDU_EVT_OFFSET_C + EVT_CDU_L_L2)
// #define EVT_CDU_C_L3									(CDU_EVT_OFFSET_C + EVT_CDU_L_L3)
// #define EVT_CDU_C_L4									(CDU_EVT_OFFSET_C + EVT_CDU_L_L4)
// #define EVT_CDU_C_L5									(CDU_EVT_OFFSET_C + EVT_CDU_L_L5)
// #define EVT_CDU_C_L6									(CDU_EVT_OFFSET_C + EVT_CDU_L_L6)
// #define EVT_CDU_C_R1									(CDU_EVT_OFFSET_C + EVT_CDU_L_R1)
// #define EVT_CDU_C_R2									(CDU_EVT_OFFSET_C + EVT_CDU_L_R2)
// #define EVT_CDU_C_R3									(CDU_EVT_OFFSET_C + EVT_CDU_L_R3)
// #define EVT_CDU_C_R4									(CDU_EVT_OFFSET_C + EVT_CDU_L_R4)
// #define EVT_CDU_C_R5									(CDU_EVT_OFFSET_C + EVT_CDU_L_R5)
// #define EVT_CDU_C_R6									(CDU_EVT_OFFSET_C + EVT_CDU_L_R6)
// #define EVT_CDU_C_EXEC								(CDU_EVT_OFFSET_C + EVT_CDU_L_EXEC)
// #define EVT_CDU_C_MENU								(CDU_EVT_OFFSET_C + EVT_CDU_L_MENU)
// #define EVT_CDU_C_PREV_PAGE							(CDU_EVT_OFFSET_C + EVT_CDU_L_PREV_PAGE)
// #define EVT_CDU_C_NEXT_PAGE							(CDU_EVT_OFFSET_C + EVT_CDU_L_NEXT_PAGE)

const PMDG777_CDU_C_L1 = PMDG777_THIRD_PARTY_EVENT_ID_MIN + 653;
const PMDG777_CDU_C_EVENT_OFFSET = PMDG777_CDU_C_L1 - (PMDG777_THIRD_PARTY_EVENT_ID_MIN + 328);

const PMDG_777_EVENT_MAP_CDU_L = {
	CDU_L_L1: {
		clientEventId: 3001,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 328}`,
	},
	CDU_L_L2: {
		clientEventId: 3002,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 329}`,
	},
	CDU_L_L3: {
		clientEventId: 3003,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 330}`,
	},
	CDU_L_L4: {
		clientEventId: 3004,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 331}`,
	},
	CDU_L_L5: {
		clientEventId: 3005,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 332}`,
	},
	CDU_L_L6: {
		clientEventId: 3006,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 333}`,
	},
	CDU_L_R1: {
		clientEventId: 3007,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 334}`,
	},
	CDU_L_R2: {
		clientEventId: 3008,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 335}`,
	},
	CDU_L_R3: {
		clientEventId: 3009,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 336}`,
	},
	CDU_L_R4: {
		clientEventId: 3010,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 337}`,
	},
	CDU_L_R5: {
		clientEventId: 3011,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 338}`,
	},
	CDU_L_R6: {
		clientEventId: 3012,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 339}`,
	},
	CDU_L_EXEC: {
		clientEventId: 3013,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 349}`,
	},
	CDU_L_MENU: {
		clientEventId: 3014,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 350}`,
	},
	CDU_L_PREV_PAGE: {
		clientEventId: 3015,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 352}`,
	},
	CDU_L_NEXT_PAGE: {
		clientEventId: 3016,
		simEventName: `#${PMDG777_THIRD_PARTY_EVENT_ID_MIN + 353}`,
	},
} as const;

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
