import  { LevelBase, FormNode } from "../level";
import { UiMailBox } from "./UiMailBox";


export class UiContainer {
    private static instance: UiContainer;

    public static getInstance(): UiContainer {
        if (!UiContainer.instance) {
            UiContainer.instance = new UiContainer();
        }

        return UiContainer.instance;
    }

    private pendingQueue: Map<string, LevelBase>;
    private formNodeContainer: Map<string, FormNode>;

    public constructor() {
        this.pendingQueue = new Map<string, LevelBase>();
        this.formNodeContainer = new Map<string, FormNode>();

        UiMailBox.getInstance().on(
            "renderCalling",
            async (playerIdentifier: string, triggerId: string): Promise<void> => {
            let level: LevelBase | null = null;

            if (this.pendingQueue.has(triggerId)) {
                level = this.pendingQueue.get(triggerId)!;

                this.pendingQueue.delete(triggerId);
            } else if (this.formNodeContainer.has(triggerId)) {
                level = this.formNodeContainer.get(triggerId)!;
            }

            await level?.render(playerIdentifier);

            if (level) {
                UiMailBox.getInstance().fulfill(level.getType(), playerIdentifier, triggerId, level.getOccupiedTicks());
            }
        });
    }

    public pend(triggerId: string, level: LevelBase): void {
        this.pendingQueue.set(triggerId, level);
    }

    public register(triggerId: string, formNode: FormNode): void {
        this.formNodeContainer.set(triggerId, formNode);
    }
}
