import { LevelBase } from "../LevelBase";
import { LevelType } from "../LevelType";


export class SubTitle implements LevelBase {
    private readonly content: string;
    private readonly fadeInTime?: number;
    private readonly stayTime?: number;
    private readonly fadeOutTime?: number;

    public constructor(content: string, fadeInTime?: number, stayTime?: number, fadeOutTime?: number) {
        this.content = content;
        this.fadeInTime = fadeInTime;
        this.stayTime = stayTime;
        this.fadeOutTime = fadeOutTime;
    }

    public async render(playerIdentifier: string): Promise<void> {
        mc.getPlayer(playerIdentifier)?.setTitle(
            this.content,
            3,
            this.fadeInTime ?? 10,
            this.stayTime ?? 70,
            this.fadeOutTime ?? 20
        );
    }

    public getType(): LevelType {
        return LevelType.SUB_TITLE;
    }

    public getOccupiedTicks(): number {
        return (this.fadeInTime ?? 0) + (this.stayTime ?? 0) + (this.fadeOutTime ?? 0);
    }
}
