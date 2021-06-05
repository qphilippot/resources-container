import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class BooleanEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    isTrue(value) {
        return (
            value === 1 ||
            value === '1' ||
            value === 'true' ||
            value === 'on' ||
            value === 'yes'
        );
    }

    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return this.isTrue(env);
    }

    getTarget(): string {
        return 'bool';
    }

    getProcessedTypeName(): string {
        return 'bool';
    }
}