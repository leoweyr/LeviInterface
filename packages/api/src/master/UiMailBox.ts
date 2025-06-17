import EventEmitter from "node:events";
import * as net from "node:net";

import { LevelType } from "../level";
import { UiMaster } from "./UiMaster";
import { UiStatus } from "./UiStatus";


export class UiMailBox extends EventEmitter {
    private static instance: UiMailBox;

    public static getInstance(): UiMailBox {
        if (!UiMailBox.instance) {
            UiMailBox.instance = new UiMailBox();
        }

        return UiMailBox.instance;
    }

    private readonly client: net.Socket;

    private constructor() {
        super();

        this.client = new net.Socket();

        this.client.on("connect", (): void => {
            this.client.on("data", (data: Buffer): void =>  {
                try {
                    const jsonString: string = data.toString("utf-8");
                    const jsonData: {
                        playerIdentifier: string,
                        triggerId: string
                    } = JSON.parse(jsonString);

                    this.emit("renderCalling", jsonData.playerIdentifier, jsonData.triggerId);
                } catch (error) {
                    logger.error(error);
                }
            });

            this.client.on("error", (error: Error): void => {
                logger.error(error);
            });

            this.client.on("close", (): void => {
                logger.warn("Socket client closed. Reconnecting...");

                setTimeout((): void => {
                    this.client.connect(UiMaster.PIPE_PATH);
                });
            });
        });

        this.client.connect(UiMaster.PIPE_PATH);
    }

    public pend(levelType: LevelType, targetPlayerIdentifier: string, triggerId: string, occupiedTicks: number): void {
        const pendingRenderMetaData: {
            levelType: LevelType,
            targetPlayerIdentifier: string,
            triggerId: string,
            occupiedTicks: number
            status: UiStatus
        } = {
            levelType: levelType,
            targetPlayerIdentifier: targetPlayerIdentifier,
            triggerId: triggerId,
            occupiedTicks: occupiedTicks,
            status: UiStatus.PENDING
        };

        this.client.write(JSON.stringify(pendingRenderMetaData));
    }

    public fulfill(levelType: LevelType, targetPlayerIdentifier: string, triggerId: string, occupiedTicks: number): void {
        const fulfilledRenderMetaData: {
            levelType: LevelType,
            targetPlayerIdentifier: string,
            triggerId: string,
            occupiedTicks: number,
            status: UiStatus
        } = {
            levelType: levelType,
            targetPlayerIdentifier: targetPlayerIdentifier,
            triggerId: triggerId,
            occupiedTicks: occupiedTicks,
            status: UiStatus.FULFILLED
        };

        this.client.write(JSON.stringify(fulfilledRenderMetaData) + "\n");
    }
}
