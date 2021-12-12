import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class TrimEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return (String(env)).trim();
    }

    public getTarget(): string {
        return 'trim';
    }

    public getProcessedTypeName(): string {
        return 'string';
    }
}
