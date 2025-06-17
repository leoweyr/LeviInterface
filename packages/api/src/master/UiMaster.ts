import { randomUUID } from "node:crypto";

import { LevelBase, FormNode } from "../level";
import { UiContainer } from "./UiContainer";
import { UiMailBox } from "./UiMailBox";


export class UiMaster {
    public static readonly PIPE_PATH: string = "\\\\?\\pipe\\levi_interface";
    private static instance: UiMaster;

    public static getInstance(): UiMaster {
        if (!UiMaster.instance) {
            UiMaster.instance = new UiMaster();
        }

        return UiMaster.instance;
    }

    private constructor() {}

    public pend(playerIdentifier: string, level: LevelBase): void {
        const triggerId: string = randomUUID();

        UiContainer.getInstance().pend(triggerId, level);

        UiMailBox.getInstance().pend(level.getType(), playerIdentifier, triggerId, level.getOccupiedTicks());
    }

    public register(triggerId: string, formNode: FormNode): void {
        UiContainer.getInstance().register(triggerId, formNode);
    }
}
