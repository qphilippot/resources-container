import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";


export default class FloatEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        /* eslint-enable @typescript-eslint/no-unused-vars */
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        const number = parseFloat(env);

        if (Number.isNaN(number)) {
            throw new RuntimeException(`Non-numeric env var "${name}" cannot be cast to float.`);
        }

        return number;
    }

    public getTarget(): string {
        return 'float';
    }

    public getProcessedTypeName(): string {
        return 'float';
    }
}
