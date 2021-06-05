import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";
import BooleanEnvProcessor from "./boolean.env-processor";



export default class NotEnvProcessor extends BooleanEnvProcessor implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        return !super.process(prefix, name, getEnv, manager);
    }

    getTarget(): string {
        return 'not';
    }
}