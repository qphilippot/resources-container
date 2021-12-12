import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import BooleanEnvProcessor from "./boolean.env-processor";


export default class NotEnvProcessor extends BooleanEnvProcessor implements EnvVarProcessorInterface {
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        return !super.process(prefix, name, getEnv, manager);
    }

    public getTarget(): string {
        return 'not';
    }
}
