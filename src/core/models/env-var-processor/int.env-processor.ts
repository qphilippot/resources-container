import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";


export default class IntEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    public isTrue(value): boolean {
        return (
            value === 1 ||
            value === '1' ||
            value === 'true' ||
            value === 'on' ||
            value === 'yes'
        );
    }

    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        // Use parseFloat instead of parseInt cause parseInt does not resolve '1e1' correctly
        const number = Math.trunc(parseFloat(env));

        if (Number.isNaN(number)) {
            throw new RuntimeException(`Non-numeric env var "${name}" cannot be cast to int.`);
        }

        return number;
    }

    public getTarget(): string {
        return 'int';
    }

    public getProcessedTypeName(): string {
        return 'int';
    }
}
