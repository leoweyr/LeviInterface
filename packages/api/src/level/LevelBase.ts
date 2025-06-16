import { LevelType } from "./LevelType";


export interface LevelBase {
    render(playerIdentifier: string): Promise<void>;

    getType(): LevelType;

    getOccupiedTicks(): number;
}
