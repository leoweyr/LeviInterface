import { FormQueue } from "../ui_queue/FormQueue";
import { TitleQueue } from "../ui_queue/TitleQueue";


export class UiMaster {
    private readonly formQueue: FormQueue;
    private readonly titleQueue: TitleQueue;
    private readonly subTitleQueue: TitleQueue;

    public constructor(playerIdentifier: string) {
        this.formQueue = new FormQueue(playerIdentifier);
        this.titleQueue = new TitleQueue(playerIdentifier);
        this.subTitleQueue = new TitleQueue(playerIdentifier);
    }

    public pendFormLevel(triggerId: string): void {
        this.formQueue.add(triggerId);
    }

    public pendTitleLevel(triggerId: string, occupiedTicks: number): void {
        this.titleQueue.add(triggerId, occupiedTicks);
    }

    public pendSubTitleLevel(triggerId: string, occupiedTicks: number): void {
        this.subTitleQueue.add(triggerId, occupiedTicks);
    }

    public render(): void {
        if (this.formQueue.isEmpty()) {
            this.titleQueue.render();
            this.subTitleQueue.render();
        } else {
            this.formQueue.render();
        }
    }
}
