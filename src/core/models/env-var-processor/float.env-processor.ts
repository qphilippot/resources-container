import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";



export default class FloatEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
     process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        const number = parseFloat(env);

        if (Number.isNaN(number)) {
            throw new RuntimeException(`Non-numeric env var "${name}" cannot be cast to float.`);
        }

        return number;
    }

    getTarget(): string {
        return 'float';
    }

    getProcessedTypeName(): string {
        return 'float';
    }
}
