import RuntimeException from "../../exception/runtime.exception";
import EnvNotFoundException from "../../exception/env-not-found.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import FlexibleService from "../../../utils/flexible.service";

export default class KeyEnvProcessor extends EnvAwareProcessorModel {
    private flexible: FlexibleService;

    constructor() {
        super();

        this.flexible = new FlexibleService();
    }

    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const tokens: Array<string> = name.split(':');

        if (tokens.length === 1 || tokens[0].length === 0) {
            throw new RuntimeException(`Invalid env "key:${name}": a key specifier should be provided.`);
        }

        const key: string = tokens.shift() ?? '';
        const next = tokens.join(':');
        const obj: any = getEnv(next);

        if (typeof obj === 'undefined') {
            throw new RuntimeException(`Resolved value of "${name}" does not match with any value.`);
        }

        if (typeof obj !== 'object' || obj === null) {
            throw new RuntimeException(`Resolved value of "${next}" did not result in an object value.`);
        }

        const value = obj[key];

        if (typeof value === 'undefined' || value === null) {
            throw new EnvNotFoundException(
                `Key "${key}" not found in ${JSON.stringify(obj)} (resolved from "${next}").`
            );
        }

        return value;
    }

    getTarget(): string {
        return 'key';
    }

    getProcessedTypeName(): string {
        return 'bool|int|float|string|array|object';
    }
}