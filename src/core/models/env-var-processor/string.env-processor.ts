import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class StringEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);

        if (typeof env === 'object') {
            return JSON.stringify(env);
        }

        return String(env);
    }
    /* eslint-enable @typescript-eslint/ban-types */

    public getTarget(): string {
        return 'string';
    }

    public getProcessedTypeName(): string {
        return 'string';
    }
}
