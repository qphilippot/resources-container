import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import RuntimeException from "../../exception/runtime.exception";



export default class ConstEnvProcessor extends EnvAwareProcessorModel implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        // let env = this.retrieveEnv(prefix, name, getEnv, manager);
        // // Use parseFloat instead of parseInt cause parseInt does not resolve '1e1' correctly
        // const number = Math.trunc(parseFloat(env));
        //
        // if (Number.isNaN(number)) {
        //     throw new RuntimeException(`Non-numeric env var "${name}" cannot be cast to int.`);
        // }
        //
        // return number;

        // todo try dynamic import (the path could be extract from name)
        // todo try with namespace
    }

    getTarget(): string {
        return 'const';
    }

    getProcessedTypeName(): string {
        return 'any';
    }
}