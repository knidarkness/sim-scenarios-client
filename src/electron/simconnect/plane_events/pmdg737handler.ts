import { SimConnectConnection } from "node-simconnect";
import {
  PMDG_737_EVENT_MAP,
} from "../types";
import { PMDGBaseCommandHandler } from "./pmdgBaseHandler";

export class PMDG737CommandHandler extends PMDGBaseCommandHandler {

  constructor(simConnectConnection: SimConnectConnection) {
    super(simConnectConnection, {
      aircraft: "PMDG73X",
      eventMap: PMDG_737_EVENT_MAP,
      lskRows: [
        PMDG_737_EVENT_MAP.CDU_R_L1,
        PMDG_737_EVENT_MAP.CDU_R_L2,
        PMDG_737_EVENT_MAP.CDU_R_L3,
        PMDG_737_EVENT_MAP.CDU_R_L4,
        PMDG_737_EVENT_MAP.CDU_R_L5,
      ],
      navigateToFaults: [
        PMDG_737_EVENT_MAP.CDU_R_MENU,
        PMDG_737_EVENT_MAP.CDU_R_R4,
        PMDG_737_EVENT_MAP.CDU_R_L1,
        PMDG_737_EVENT_MAP.CDU_R_L3,
      ],
      nextPage: PMDG_737_EVENT_MAP.CDU_R_NEXT_PAGE,
      selectProgrammed: PMDG_737_EVENT_MAP.CDU_R_L1,
      activate: PMDG_737_EVENT_MAP.CDU_R_L1,
      execute: PMDG_737_EVENT_MAP.CDU_R_EXEC,
      exitMenu: PMDG_737_EVENT_MAP.CDU_R_MENU,
      faultsPerPage: 5,
      handlerName: "PMDG737CommandHandler",
    });
  }
}
