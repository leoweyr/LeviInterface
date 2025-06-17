import { UiPostOffice } from "../master/UiPostOffice";


export class TitleQueue {
    private readonly playerIdentifier: string;
    private readonly queue: Array<string>;

    public constructor(playerIdentifier: string) {
        this.playerIdentifier = playerIdentifier;
        this.queue = new Array<string>();
    }

    public add(triggerId: string, occupiedTicks: number): void {
        this.queue.push(triggerId);

        for (let emptyFrame: number = 0; emptyFrame < occupiedTicks; emptyFrame++) {
            this.queue.push("");
        }
    }

    public render(): void {
        if (this.queue.length !== 0) {
            const pendingTriggerId: string = this.queue.shift()!;

            if (pendingTriggerId !== "") {
                UiPostOffice.getInstance().remoteCall(this.playerIdentifier, pendingTriggerId);
            }
        }
    }
}
