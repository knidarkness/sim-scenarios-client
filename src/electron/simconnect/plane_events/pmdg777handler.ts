import { SimConnectConnection } from "node-simconnect";
import { EventMapEntry } from "../types";
import { PMDGBaseCommandHandler } from "./pmdgBaseHandler";

export class PMDG777CommandHandler extends PMDGBaseCommandHandler {
  private static readonly THIRD_PARTY_EVENT_ID_MIN = 69632;
  private static readonly CDU_C_L1 =
    PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 653;
  private static readonly CDU_C_EVENT_OFFSET =
    PMDG777CommandHandler.CDU_C_L1 -
    (PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 328);

  private static readonly EVENT_MAP: Record<string, EventMapEntry> = {
    CDU_C_L1: {
      clientEventId: 3101,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 653}`,
    },
    CDU_C_L2: {
      clientEventId: 3102,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 329 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_L3: {
      clientEventId: 3103,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 330 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_L4: {
      clientEventId: 3104,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 331 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_L5: {
      clientEventId: 3105,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 332 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_L6: {
      clientEventId: 3106,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 333 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R1: {
      clientEventId: 3107,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 334 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R2: {
      clientEventId: 3108,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 335 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R3: {
      clientEventId: 3109,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 336 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R4: {
      clientEventId: 3110,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 337 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R5: {
      clientEventId: 3111,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 338 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_R6: {
      clientEventId: 3112,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 339 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_EXEC: {
      clientEventId: 3113,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 349 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_MENU: {
      clientEventId: 3114,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 350 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_PREV_PAGE: {
      clientEventId: 3115,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 352 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
    CDU_C_NEXT_PAGE: {
      clientEventId: 3116,
      simEventName: `#${PMDG777CommandHandler.THIRD_PARTY_EVENT_ID_MIN + 353 + PMDG777CommandHandler.CDU_C_EVENT_OFFSET}`,
    },
  };

  constructor(simConnectConnection: SimConnectConnection) {
    const eventMap = PMDG777CommandHandler.EVENT_MAP;

    super(simConnectConnection, {
      aircraft: "PMDG777",
      eventMap,
      lskRows: [
        eventMap.CDU_C_L1,
        eventMap.CDU_C_L2,
        eventMap.CDU_C_L3,
        eventMap.CDU_C_L4,
        eventMap.CDU_C_L5,
      ],
      navigateToFaults: [
        eventMap.CDU_C_MENU,
        eventMap.CDU_C_R5,
        eventMap.CDU_C_L1,
        eventMap.CDU_C_L3,
      ],
      nextPage: eventMap.CDU_C_NEXT_PAGE,
      selectProgrammed: eventMap.CDU_C_L1,
      activate: eventMap.CDU_C_L1,
      execute: eventMap.CDU_C_EXEC,
      exitMenu: eventMap.CDU_C_MENU,
      faultsPerPage: 5,
      handlerName: "PMDG777CommandHandler",
    });
  }
}
