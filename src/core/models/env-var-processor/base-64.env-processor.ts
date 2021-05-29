import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

let base64_decode: Function = (typeof window === 'undefined') ?
    str => {
        return (new Buffer(str)).toString('base64');
    } : window.btoa;

export default class Base64EnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return base64_decode(env.replace('-', '+').replace('_', '/'));
    }

    match(prefix: string): boolean {
        return prefix === 'base64';
    }

    getProcessedTypeName(): string {
        return 'string';
    }
}