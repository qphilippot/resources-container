import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";



export default class IntEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
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
        const number = parseInt(env, 10);

        if (Number.isNaN(number)) {
            throw new RuntimeException(`Non-numeric env var "${name}" cannot be cast to int.`);
        }

        return number;
    }

    match(prefix: string): boolean {
        return prefix === 'int';
    }

    getProcessedTypeName(): string {
        return 'int';
    }
}