import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class StringEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);

        if (typeof env === 'object') {
            return JSON.stringify(env);
        }

        return String(env);
    }

    getTarget(): string {
        return 'string';
    }

    getProcessedTypeName(): string {
        return 'string';
    }
}