import { UiPostOffice } from "../master/UiPostOffice";


export class FormQueue {
    private readonly playerIdentifier: string;
    private readonly queue: Array<string>;
    private isBlocked: boolean;

    public constructor(playerIdentifier: string) {
        this.playerIdentifier = playerIdentifier;
        this.queue = new Array<string>();
        this.isBlocked = false;
    }

    public add(triggerId: string): void {
        this.queue.push(triggerId);
    }

    public async render(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (this.isBlocked) {
                resolve();
            } else if (this.queue.length !== 0) {
                this.isBlocked = true;

                const pendingTriggerId: string = this.queue.shift()!;

                UiPostOffice.getInstance().on("renderFulfilled", (triggerId: string): void => {
                    if (pendingTriggerId === triggerId) {
                        this.isBlocked = false;
                        resolve();
                    }
                });

                UiPostOffice.getInstance().remoteCall(this.playerIdentifier, pendingTriggerId);
            }
        });
    }

    public isEmpty(): boolean {
        return this.queue.length == 0;
    }
}
