import ArgumentInterface from "../interfaces/argument.interface";


export class BoundArgument implements ArgumentInterface {
    public static readonly SERVICE_BINDING = 0;
    public static readonly DEFAULTS_BINDING = 1;
    public static readonly INSTANCEOF_BINDING = 2;

    private static sequence: number = 0;

    private value;
    private identifier: number | null = null;
    private used: boolean | null = null;
    private type: number;
    private path: string | null;

    constructor(value, trackUsage: boolean = false, type: number = 0, path: string | null = null) {
        this.value = value;

        if (trackUsage) {
            this.identifier = ++BoundArgument.sequence;
        }
        else {
            this.used = true;
        }
        
        this.type = type;
        this.path = path;
    }
    
    getValues(): Array<any> {
        return [
            this.value,
            this.identifier,
            this.used,
            this.type,
            this.path
        ];
    }
    
    setValues(values: Array<any>) {
        if (5 === values.length) {
            [this.value, this.identifier, this.used, this.type, this.path] = values;
        }

        else {
            [this.value, this.identifier, this.used] = values;
        }
    }
}
