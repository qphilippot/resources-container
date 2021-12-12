import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class TrimEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return (String(env)).trim();
    }

    getTarget(): string {
        return 'trim';
    }

    getProcessedTypeName(): string {
        return 'string';
    }
}
