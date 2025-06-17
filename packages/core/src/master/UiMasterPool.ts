import { UiMaster } from "./UiMaster";


export class UiMasterPool {
    private static instance: UiMasterPool;

    public static getInstance(): UiMasterPool {
        if (!UiMasterPool.instance) {
            UiMasterPool.instance = new UiMasterPool();
        }

        return UiMasterPool.instance;
    }

    private pool: Map<string, UiMaster> = new Map<string, UiMaster>();

    private constructor() {
        mc.listen("onTick", (): void => {
            for (let [playerIdentifier, uiMaster] of this.pool) {
                uiMaster.render();
            }
        });

        mc.listen("onJoin", (player: Player): void => {
            this.add(player.xuid);
        });

        mc.listen("onLeft", (player: Player): void => {
            this.remove(player.xuid);
        });
    }

    public add(playerIdentifier: string): void {
        if (!this.pool.has(playerIdentifier)) {
            this.pool.set(playerIdentifier, new UiMaster(playerIdentifier));
        }
    }

    public remove(playerIdentifier: string): void {
        if (this.pool.has(playerIdentifier)) {
            this.pool.delete(playerIdentifier);
        }
    }

    public get(playerIdentifier: string): UiMaster | null {
        return this.pool.get(playerIdentifier) ?? null;
    }
}
