import { availableEvents } from "./plane_events/types";
import { EVENT_MAP, EventMapEntry } from "./types";

export const PMDDG_73X_HELPER_EVENTS = {
  OPEN_FAULT_MENU: [
    EVENT_MAP.CDU_R_MENU,
    EVENT_MAP.CDU_R_R4,
    EVENT_MAP.CDU_R_L1,
    EVENT_MAP.CDU_R_L3,
  ],
  CDU_NEXT_PAGE: [EVENT_MAP.CDU_R_NEXT_PAGE],
  CDU_EXECUTE: [EVENT_MAP.CDU_R_EXEC],
  CDU_ACTIVATE_FAULT: [EVENT_MAP.CDU_R_L1, EVENT_MAP.CDU_R_EXEC],
  CDU_PROGRAMMED_FAULT: [EVENT_MAP.CDU_R_L1],
};

export const PMDG_73X_CDU_COMMANDS = {
    'Engine 1 Failure': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        EVENT_MAP.CDU_R_L3,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
    'Engine 2 Failure': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        EVENT_MAP.CDU_R_L4,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
    'HYD A Leak': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L1,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
    'HYD B Leak': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
    'GEN 1 Failure': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L1,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        EVENT_MAP.CDU_R_L1,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
    'GEN 2 Failure': [
        ...PMDDG_73X_HELPER_EVENTS.OPEN_FAULT_MENU,
        ...PMDDG_73X_HELPER_EVENTS.CDU_NEXT_PAGE,
        EVENT_MAP.CDU_R_L1,
        ...PMDDG_73X_HELPER_EVENTS.CDU_PROGRAMMED_FAULT,
        EVENT_MAP.CDU_R_L2,
        ...PMDDG_73X_HELPER_EVENTS.CDU_ACTIVATE_FAULT,
        EVENT_MAP.CDU_R_MENU,
    ],
}

export function getFaultPathForEvent(aircraft: string, eventName: string): EventMapEntry[] | null {
    const LSK_ROWS = [
        EVENT_MAP.CDU_R_L1,
        EVENT_MAP.CDU_R_L2,
        EVENT_MAP.CDU_R_L3,
        EVENT_MAP.CDU_R_L4,
        EVENT_MAP.CDU_R_L5,
    ]

    const FAULTS_PER_PAGE = 5;
    const allEvents = availableEvents.filter(e => e.aircraft === aircraft).pop();
    if (!allEvents) {
        return null;
    }
    const eventCategory = allEvents.categories.find(c => c.events.some(e => e === eventName));
    if (!eventCategory) {
        return null;
    }
    const categoryIndex = allEvents.categories.findIndex(c => c.name === eventCategory.name);
    const categoryPageIndex = Math.floor(categoryIndex / FAULTS_PER_PAGE);
    const categoryIndexInPage = categoryIndex % FAULTS_PER_PAGE;

    const eventIndexInCategory = eventCategory.events.findIndex(e => e === eventName);
    if (eventIndexInCategory === -1) {
        return null;
    }
    const pageIndex = Math.floor(eventIndexInCategory / FAULTS_PER_PAGE);
    const indexInPage = eventIndexInCategory % FAULTS_PER_PAGE;
    console.log(`Event: ${eventName}, Category: ${eventCategory.name}, Category Page: ${categoryPageIndex}, Category Index in Page: ${categoryIndexInPage}, Event Page: ${pageIndex}, Event Index in Page: ${indexInPage}`);
    
    const commandsToFault: EventMapEntry[] = [
        EVENT_MAP.CDU_R_MENU, // Exit to menu
        EVENT_MAP.CDU_R_R4, // Enter PMDG Setup,
        EVENT_MAP.CDU_R_L1, // Select Aircraft
        EVENT_MAP.CDU_R_L3, // Select Faults
        ...Array(categoryPageIndex).fill(EVENT_MAP.CDU_R_NEXT_PAGE),
        LSK_ROWS[categoryIndexInPage],
        EVENT_MAP.CDU_R_L1, // Select programmed
        ...Array(pageIndex).fill(EVENT_MAP.CDU_R_NEXT_PAGE),
        LSK_ROWS[indexInPage],
        EVENT_MAP.CDU_R_L1, // Activate
        EVENT_MAP.CDU_R_EXEC, // Execute
        EVENT_MAP.CDU_R_MENU, // Exit to menu
    ];
    return commandsToFault;
}