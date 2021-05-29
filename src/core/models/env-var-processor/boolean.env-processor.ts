import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";



export default class StringEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
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
        let env = this.retrieveEnv(prefix, name, getEnv, manager);
        env = this.isTrue(env);
        return 'not' === prefix ? !env : env;
    }

    match(prefix: string): boolean {
        return prefix.includes('bool') || prefix.includes('not');
    }

    getProcessedTypeName(): string {
        return 'bool';
    }
}