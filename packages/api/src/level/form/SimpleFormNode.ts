import { FormNode } from "./FormNode";
import { SimpleFormLayerType } from "../enums/SimpleFormLayerType";
import { LevelType } from "../LevelType";


export class SimpleFormNode implements FormNode {
    private father: FormNode | null;
    private readonly preload?: (self: SimpleFormNode) => Promise<void>;

    private readonly title?: string;
    private content?: string;
    private readonly controls: Array<{
        type: SimpleFormLayerType,
        options?: { text: string, image?: string } | { text: string },
        callback?: (father: FormNode, playerIdentifier: string) => Promise<void>
    }>;

    public constructor(title?: string, content?: string, preload?: (self: SimpleFormNode) => Promise<void>) {
        this.father = null;
        this.preload = preload;

        this.title = title;
        this.content = content;
        this.controls = new Array<{
            type: SimpleFormLayerType,
            options?: { text: string, image?: string } | { text: string },
            callback?: (father: FormNode, playerIdentifier: string) => Promise<void>
        }>();
    }

    public setFather(father: FormNode): void {
        this.father = father;
    }

    public setContent(content: string): void {
        this.content = content;
    }

    public addButton(
        text: string,
        image?: string,
        callback?: (father: FormNode, playerIdentifier: string) => Promise<void>): SimpleFormNode {
        this.controls.push({
            type: SimpleFormLayerType.BUTTON,
            options: { text: text, image: image },
            callback: callback
        });

        return this;
    }

    public addLabel(text: string): SimpleFormNode {
        this.controls.push({ type: SimpleFormLayerType.LABEL, options: { text: text } });

        return this;
    }

    public addDivider(): SimpleFormNode {
        this.controls.push({ type: SimpleFormLayerType.DIVIDER });

        return this;
    }

    public async render(playerIdentifier: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.preload) {
                await this.preload(this);
            }

            const form: SimpleForm = mc.newSimpleForm();

            if (this.title) {
                form.setTitle(this.title);
            }

            if (this.content) {
                form.setContent(this.content);
            }

            if (this.father) {
                form.addButton("返回");
            }

            for (const control of this.controls) {
                if (control.type === SimpleFormLayerType.BUTTON) {
                    const options: { text: string, image?: string } = control.options as {
                        text: string,
                        image?: string
                    };
                    form.addButton(options.text, options.image ?? "");
                } else if (control.type === SimpleFormLayerType.LABEL) {
                    const options: { text: string } = control.options as { text: string };
                    form.addLabel(options.text);
                } else if (control.type === SimpleFormLayerType.DIVIDER) {
                    form.addDivider();
                }
            }

            mc.getPlayer(playerIdentifier)?.sendForm(form, (player: Player, data: number | undefined): void => {
                setTimeout(async (): Promise<void> => {
                    if (this.father && data === 0) {
                        await this.father.render(playerIdentifier);
                    } else if (data || data === 0) {
                        let controlIndex: number = (data as number);

                        if (this.father) {
                            controlIndex -= 1;
                        }

                        await this.controls[controlIndex]!.callback!(this, playerIdentifier);
                    }

                    resolve();
                });
            });
        });
    }

    public getType(): LevelType {
        return LevelType.FORM;
    }

    public getOccupiedTicks(): number {
        return 0;
    }
}
