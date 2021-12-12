import type EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import type EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class BooleanEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
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
        return this.isTrue(env);
    }

    public getTarget(): string {
        return 'bool';
    }

    public getProcessedTypeName(): string {
        return 'bool';
    }
}
