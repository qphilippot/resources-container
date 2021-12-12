import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

const base64_decode: Function = (typeof window === 'undefined') ?
    str => {
        return Buffer.from(str, 'base64').toString('ascii');
    } : window.atob;

export default class Base64EnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const env = this.retrieveEnv(prefix, name, getEnv, manager);
        return base64_decode(env.replace('-', '+').replace('_', '/'));
    }

    public getTarget(): string {
        return 'base64';
    }

    public getProcessedTypeName(): string {
        return 'string';
    }
}
