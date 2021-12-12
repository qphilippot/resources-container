import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";


export default class JsonEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
     public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);

        if (typeof env !== 'string' && env !== null) {
            throw new RuntimeException(`Invalid JSON in env var "${name}": ${typeof env} is not a valid JSON string`);
        }

        try {
            return JSON.parse(env);
        }
         catch (error) {
             throw new RuntimeException(`Invalid JSON in env var "${name}": ${error.message}`);
         }
    }

    public getTarget() {
        return 'json';
    }

    public getProcessedTypeName(): string {
        return 'object';
    }
}
