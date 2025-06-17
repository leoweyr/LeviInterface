import EventEmitter from "node:events";
import * as net from "node:net";

import { LevelType, UiStatus, UiMaster } from "@levimc-lse/interface-api";

import * as GlobalUiMaster from "./UiMaster";
import { UiMasterPool } from "./UiMasterPool";


export class UiPostOffice extends EventEmitter {
    private static instance: UiPostOffice;

    public static getInstance(): UiPostOffice {
        if (!UiPostOffice.instance) {
            UiPostOffice.instance = new UiPostOffice();
        }

        return UiPostOffice.instance;
    }

    private readonly server: net.Server;
    private readonly clients: Set<net.Socket>;

    private constructor() {
        super();

        this.clients = new Set<net.Socket>;

        this.server = net.createServer((socket: net.Socket): void => {
            this.clients.add(socket);

            socket.on("data", (data: Buffer): void => {
                try {
                    const jsonString: string = data.toString("utf-8");
                    const jsonData: {
                        levelType: LevelType;
                        targetPlayerIdentifier: string;
                        triggerId: string;
                        occupiedTicks: number;
                        status: UiStatus;
                    } = JSON.parse(jsonString);

                    if (jsonData.status === UiStatus.PENDING) {
                        const tryGetUiMaster: (
                            retries: number,
                            delayMilliseconds: number
                        ) => void = (retries: number, delayMilliseconds: number): void => {
                            const uiMaster: GlobalUiMaster.UiMaster | null
                                = UiMasterPool.getInstance().get(jsonData.targetPlayerIdentifier);

                            if (uiMaster !== null) {
                                if (jsonData.levelType === LevelType.FORM) {
                                    uiMaster?.pendFormLevel(jsonData.triggerId);
                                } else if (jsonData.levelType === LevelType.TITLE) {
                                    uiMaster?.pendTitleLevel(jsonData.triggerId, jsonData.occupiedTicks);
                                } else if (jsonData.levelType === LevelType.SUB_TITLE) {
                                    uiMaster?.pendSubTitleLevel(jsonData.triggerId, jsonData.occupiedTicks);
                                }
                            } else if (retries > 0) {
                                setTimeout(
                                    (): void => tryGetUiMaster(retries - 1, delayMilliseconds),
                                    delayMilliseconds
                                );
                            } else {
                                logger.warn(`UI master not found for player ${jsonData.targetPlayerIdentifier}.`);
                            }
                        }

                        tryGetUiMaster(3, 1000);
                    } else if (jsonData.status === UiStatus.FULFILLED) {
                        this.emit("renderFulfilled", jsonData.triggerId);
                    }
                } catch (error) {
                    logger.error(error);
                }
            });

            socket.on("close", (): void => {
                this.clients.delete(socket);
            });
        });

        this.on("renderCalling", (playerIdentifier: string, triggerId: string): void => {
                const remoteCallMetaData: {
                    playerIdentifier: string,
                    triggerId: string
                } = {
                    playerIdentifier: playerIdentifier,
                    triggerId: triggerId
                };

                for (const client of this.clients) {
                    if (!client.destroyed) {
                        client.write(JSON.stringify(remoteCallMetaData) + "\n");
                    }
                }
        });

        this.server.listen(UiMaster.PIPE_PATH);
    }

    public remoteCall(playerIdentifier: string, triggerId: string): void {
        this.emit("renderCalling", playerIdentifier, triggerId);
    }
}
