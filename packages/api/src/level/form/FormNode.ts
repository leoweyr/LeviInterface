import { LevelBase } from "../LevelBase";


export interface FormNode extends LevelBase {
    setFather(father: FormNode): void;
}
