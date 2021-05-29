import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

let base64_decode: Function = (typeof window === 'undefined') ?
    str => {
        return (new Buffer(str)).toString('base64');
    } : window.btoa;

export default class StringEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return env as string;
    }

    match(prefix: string): boolean {
        return prefix === 'string';
    }

    getProcessedTypeName(): string {
        return 'string';
    }
}