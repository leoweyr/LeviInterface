import { UiMasterPool } from "./master/UiMasterPool";
import { UiPostOffice } from "./master/UiPostOffice";


(async (): Promise<void> => {
    UiMasterPool.getInstance();

    UiPostOffice.getInstance();
})();
