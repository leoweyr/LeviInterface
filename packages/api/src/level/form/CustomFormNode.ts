import { FormNode } from "./FormNode";
import { CustomFormLayerType } from "../enums/CustomFormLayerType";
import { LevelType } from "../LevelType";


export class CustomFormNode implements FormNode {
    private father: FormNode | null;
    private readonly preload?: (self: CustomFormNode) => Promise<void>;

    private readonly title: string;
    private readonly controls: Array<{
        type: CustomFormLayerType,
        options:
            { text: string } |
            { title: string, placeholder?: string, default?: string } |
            { title: string, default?: boolean } |
            { title: string, items: Array<string>, default?: number } |
            { title: string, min: number, max: number, step: number, default?: number },
        callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
    }>;
    private readonly multiFactorTriggers: Array<{
        trigger: Array<any>,
        callback: (father: FormNode, playerIdentifier: string) => Promise<void>
    }>;

    public constructor(title: string, preload?: (self: CustomFormNode) => Promise<void>) {
        this.father = null;
        this.preload = preload;

        this.title = title;
        this.controls = new Array<{
            type: CustomFormLayerType,
            options:
                { text: string } |
                { title: string, placeholder?: string, default?: string } |
                { title: string, default?: boolean } |
                { title: string, items: Array<string>, default?: number } |
                { title: string, min: number, max: number, step: number, default?: number },
            callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
        }>();
        this.multiFactorTriggers = new Array<{
            trigger: Array<any>,
            callback: (father: FormNode, playerIdentifier: string) => Promise<void>
        }>();
    }

    public setFather(father: FormNode): void {
        this.father = father;
    }

    public addLabel(text: string): CustomFormNode {
        this.controls.push({ type: CustomFormLayerType.LABEL, options: { text: text } });

        return this;
    }

    public addInput(
        title: string,
        placeholder?: string,
        defaultValue?: string,
        callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
    ): CustomFormNode {
        this.controls.push({
            type: CustomFormLayerType.INPUT,
            options: { title: title, placeholder: placeholder, default: defaultValue },
            callback: callback
        });

        return this;
    }

    public addSwitch(
        title: string,
        defaultValue?: boolean,
        callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
    ): CustomFormNode {
        this.controls.push({
            type: CustomFormLayerType.SWITCH,
            options: {title: title, default: defaultValue},
            callback: callback
        });

        return this;
    }

    public addDropdown(
        title: string,
        items: Array<string>,
        defaultValue?: number,
        callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
    ): CustomFormNode {
        this.controls.push({
            type: CustomFormLayerType.DROPDOWN,
            options: { title: title, items: items, default: defaultValue },
            callback: callback
        });

        return this;
    }

    public addSlider(
        title: string,
        min: number,
        max: number,
        step: number,
        defaultValue?: number,
        callback?: (father: FormNode, playerIdentifier: string, value: undefined | string | number | boolean) => Promise<void>
    ): CustomFormNode {
        this.controls.push({
            type: CustomFormLayerType.SLIDER,
            options: { title: title, min: min, max: max, step: step, default: defaultValue },
            callback: callback
        });

        return this;
    }

    public addMultiFactorTrigger(
        trigger: Array<any>,
        callback: (father: FormNode, playerIdentifier: string) => Promise<void>
    ): CustomFormNode {
        this.multiFactorTriggers.push({ trigger: trigger, callback: callback });

        return this;
    }

    async render(playerIdentifier: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.preload) {
                await this.preload(this);
            }

            const form: CustomForm = mc.newCustomForm();

            if (this.title) {
                form.setTitle(this.title);
            }

            if (this.controls.length > 0) {
                for (const control of this.controls) {
                    if (control.type === CustomFormLayerType.LABEL) {
                        const options: { text: string } = control.options as { text: string };
                        form.addLabel(options.text);
                    } else if (control.type === CustomFormLayerType.INPUT) {
                        const options: {
                            title: string,
                            placeholder?: string,
                            default?: string
                        } = control.options as { title: string, placeholder?: string, default?: string };
                        form.addInput(options.title, options.placeholder ?? "", options.default ?? "");
                    } else if (control.type === CustomFormLayerType.SWITCH) {
                        const options: {
                            title: string,
                            default?: boolean
                        } = control.options as { title: string, default?: boolean };
                        form.addSwitch(options.title, options.default ?? true);
                    } else if (control.type === CustomFormLayerType.DROPDOWN) {
                        const options: {
                            title: string,
                            items: Array<string>,
                            default?: number
                        } = control.options as { title: string, items: Array<string>, default?: number };
                        form.addDropdown(options.title, options.items, options.default ?? 0);
                    } else if (control.type === CustomFormLayerType.SLIDER) {
                        const options: {
                            title: string,
                            min: number,
                            max: number,
                            step: number,
                            default?: number
                        } = control.options as {
                            title: string,
                            min: number,
                            max: number,
                            step: number,
                            default?: number
                        };
                        form.addSlider(
                            options.title,
                            options.min,
                            options.max,
                            options.step,
                            options.default ?? options.min
                        );
                    } else if (control.type === CustomFormLayerType.STEP_SLIDER) {
                        const options: {
                            title: string,
                            items: Array<string>,
                            default?: number
                        } = control.options as {
                            title: string,
                            items: Array<string>,
                            default?: number
                        };
                        form.addStepSlider(options.title, options.items, options.default ?? 0);
                    }
                }
            }

            mc.getPlayer(playerIdentifier).sendForm(form, (player: Player, data: (undefined | string | number | boolean)[] | undefined) => {
                setTimeout(async (): Promise<void> => {
                   if (this.father && !data) {
                       await this.father.render(playerIdentifier);
                   } else if (data) {
                       let dataIndex: number = 0;

                       for (const control of this.controls) {
                           if (control.callback) {
                               await control.callback!(this, playerIdentifier, (data as Array<any>)[dataIndex]);
                           }

                           dataIndex ++;
                       }

                       for (const trigger of this.multiFactorTriggers) {
                           if (trigger.trigger == data) {
                               await trigger.callback!(this, playerIdentifier);
                           }
                       }
                   }

                   resolve();
                });
            });
        });
    }

    getType(): LevelType {
        return LevelType.FORM;
    }

    getOccupiedTicks(): number {
        return 0;
    }
}
