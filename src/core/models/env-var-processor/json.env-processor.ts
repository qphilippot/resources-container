import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";



export default class JsonEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
     process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        let env = this.retrieveEnv(prefix, name, getEnv, manager);
        try {
            return JSON.parse(env);
        }
         catch (error) {
             throw new RuntimeException(`Invalid JSON in env var "${name}": ${error.message}`);
         }
    }

    getTarget() {
        return 'json';
    }

    getProcessedTypeName(): string {
        return 'object';
    }
}