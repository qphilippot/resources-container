import ArgumentInterface from "../../interfaces/argument.interface";

const SERVICE_BINDING = 0;
const DEFAULTS_BINDING = 1;
const INSTANCEOF_BINDING = 2;

let sequence = 0;

class BoundArgument implements ArgumentInterface {
    private value: any;
    private identifier: number | null = null;
    private used: boolean | null = null;
    private type: number;
    private file?: string;

    public constructor(value, trackUsage: boolean = true, type: number = SERVICE_BINDING, file: string = '') {
        this.value = value;
        if (trackUsage) {
            this.identifier = ++sequence;
        } else {
            this.used = true;
        }
        this.type = type;
        if (file.length > 0) {
            this.file = file;
        }
    }

    /**
     * @inheritdoc
     */
    public getValues(): Array<any> {
        return [this.value, this.identifier, this.used, this.type, this.file];
    }

    /**
     * @inheritdoc
     */
    public setValues(values: Array<any>) {
        if (5 === values.length) {
            [this.value, this.identifier, this.used, this.type, this.file] = values;
        } else {
            [this.value, this.identifier, this.used] = values;
        }
    }
}
