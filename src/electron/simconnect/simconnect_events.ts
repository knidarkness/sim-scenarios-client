import { availableEvents } from "./plane_events/types";
import { PMDG_737_EVENT_MAP, EventMapEntry } from "./types";

export const PMDDG_73X_HELPER_EVENTS = {
  OPEN_FAULT_MENU: [
    PMDG_737_EVENT_MAP.CDU_R_MENU,
    PMDG_737_EVENT_MAP.CDU_R_R4,
    PMDG_737_EVENT_MAP.CDU_R_L1,
    PMDG_737_EVENT_MAP.CDU_R_L3,
  ],
  CDU_NEXT_PAGE: [PMDG_737_EVENT_MAP.CDU_R_NEXT_PAGE],
  CDU_EXECUTE: [PMDG_737_EVENT_MAP.CDU_R_EXEC],
  CDU_ACTIVATE_FAULT: [PMDG_737_EVENT_MAP.CDU_R_L1, PMDG_737_EVENT_MAP.CDU_R_EXEC],
  CDU_PROGRAMMED_FAULT: [PMDG_737_EVENT_MAP.CDU_R_L1],
};


export function getFaultPathForEvent(aircraft: string, eventName: string): EventMapEntry[] | null {
    const LSK_ROWS = [
        PMDG_737_EVENT_MAP.CDU_R_L1,
        PMDG_737_EVENT_MAP.CDU_R_L2,
        PMDG_737_EVENT_MAP.CDU_R_L3,
        PMDG_737_EVENT_MAP.CDU_R_L4,
        PMDG_737_EVENT_MAP.CDU_R_L5,
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
        PMDG_737_EVENT_MAP.CDU_R_MENU, // Exit to menu
        PMDG_737_EVENT_MAP.CDU_R_R4, // Enter PMDG Setup,
        PMDG_737_EVENT_MAP.CDU_R_L1, // Select Aircraft
        PMDG_737_EVENT_MAP.CDU_R_L3, // Select Faults
        ...Array(categoryPageIndex).fill(PMDG_737_EVENT_MAP.CDU_R_NEXT_PAGE),
        LSK_ROWS[categoryIndexInPage],
        PMDG_737_EVENT_MAP.CDU_R_L1, // Select programmed
        ...Array(pageIndex).fill(PMDG_737_EVENT_MAP.CDU_R_NEXT_PAGE),
        LSK_ROWS[indexInPage],
        PMDG_737_EVENT_MAP.CDU_R_L1, // Activate
        PMDG_737_EVENT_MAP.CDU_R_EXEC, // Execute
        PMDG_737_EVENT_MAP.CDU_R_MENU, // Exit to menu
    ];
    return commandsToFault;
}