import { SimConnectConnection } from "node-simconnect";
import { EventMapEntry } from "../types";
import { PMDGBaseCommandHandler } from "./pmdgBaseHandler";

export class PMDG737CommandHandler extends PMDGBaseCommandHandler {
  private static readonly THIRD_PARTY_EVENT_ID_MIN = 69632;

  private static readonly EVENT_MAP: Record<string, EventMapEntry> = {
    CDU_R_L1: {
      clientEventId: 2001,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 606}`,
    },
    CDU_R_L2: {
      clientEventId: 2002,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 607}`,
    },
    CDU_R_L3: {
      clientEventId: 2003,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 608}`,
    },
    CDU_R_L4: {
      clientEventId: 2004,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 609}`,
    },
    CDU_R_L5: {
      clientEventId: 2005,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 610}`,
    },
    CDU_R_L6: {
      clientEventId: 2006,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 611}`,
    },
    CDU_R_R1: {
      clientEventId: 2007,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 612}`,
    },
    CDU_R_R2: {
      clientEventId: 2008,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 613}`,
    },
    CDU_R_R3: {
      clientEventId: 2009,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 614}`,
    },
    CDU_R_R4: {
      clientEventId: 2010,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 615}`,
    },
    CDU_R_R5: {
      clientEventId: 2011,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 616}`,
    },
    CDU_R_R6: {
      clientEventId: 2012,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 617}`,
    },
    CDU_R_EXEC: {
      clientEventId: 2013,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 628}`,
    },
    CDU_R_MENU: {
      clientEventId: 2014,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 623}`,
    },
    CDU_R_PREV_PAGE: {
      clientEventId: 2015,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 631}`,
    },
    CDU_R_NEXT_PAGE: {
      clientEventId: 2016,
      simEventName: `#${PMDG737CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 632}`,
    },
  };

  constructor(simConnectConnection: SimConnectConnection) {
    const eventMap = PMDG737CommandHandler.EVENT_MAP;

    super(simConnectConnection, {
      aircraft: "PMDG73X",
      eventMap,
      lskRows: [
        eventMap.CDU_R_L1,
        eventMap.CDU_R_L2,
        eventMap.CDU_R_L3,
        eventMap.CDU_R_L4,
        eventMap.CDU_R_L5,
      ],
      navigateToFaults: [
        eventMap.CDU_R_MENU,
        eventMap.CDU_R_R4,
        eventMap.CDU_R_L1,
        eventMap.CDU_R_L3,
      ],
      nextPage: eventMap.CDU_R_NEXT_PAGE,
      selectProgrammed: eventMap.CDU_R_L1,
      activate: eventMap.CDU_R_L1,
      execute: eventMap.CDU_R_EXEC,
      exitMenu: eventMap.CDU_R_MENU,
      faultsPerPage: 5,
      handlerName: "PMDG737CommandHandler",
    });
  }
}
