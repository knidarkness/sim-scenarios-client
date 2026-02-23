import { SimConnectConnection } from "node-simconnect";
import {
  PMDG_777_EVENT_MAP_CDU_C,
} from "../types";
import { PMDGBaseCommandHandler } from "./pmdgBaseHandler";

export class PMDG777CommandHandler extends PMDGBaseCommandHandler {

  constructor(simConnectConnection: SimConnectConnection) {
    super(simConnectConnection, {
      aircraft: "PMDG777",
      eventMap: PMDG_777_EVENT_MAP_CDU_C,
      lskRows: [
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L2,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L3,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L4,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L5,
      ],
      navigateToFaults: [
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_MENU,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_R5,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1,
        PMDG_777_EVENT_MAP_CDU_C.CDU_C_L3,
      ],
      nextPage: PMDG_777_EVENT_MAP_CDU_C.CDU_C_NEXT_PAGE,
      selectProgrammed: PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1,
      activate: PMDG_777_EVENT_MAP_CDU_C.CDU_C_L1,
      execute: PMDG_777_EVENT_MAP_CDU_C.CDU_C_EXEC,
      exitMenu: PMDG_777_EVENT_MAP_CDU_C.CDU_C_MENU,
      faultsPerPage: 5,
      handlerName: "PMDG777CommandHandler",
    });
  }
}
