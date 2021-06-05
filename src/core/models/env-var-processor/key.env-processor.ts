import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import RuntimeException from "../../exception/runtime.exception";
import EnvNotFoundException from "../../exception/env-not-found.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class KeyEnvProcessor extends EnvAwareProcessorModel{
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        let i = name.indexOf(':');
        if (prefix === 'key') {
            if (i < 0) {
                throw new RuntimeException(`Invalid env "key:${name}": a key specifier should be provided.`);
            }


            let next = name.substr(i + 1);
            let key = name.substr(0, i);
            let array = getEnv(next);

            if (!Array.isArray(array)) {
                throw new RuntimeException(`Resolved value of "${next}" did not result in an array value.`);
            }

            if (typeof array[key] === 'undefined') {
                throw new EnvNotFoundException(
                    `Key "${key}" not found in ${JSON.stringify(array)} (resolved from "${next}").`
                );
            }

            return array[key];
        }
    }

    getTarget(): string {
        return 'key';
    }

    getProcessedTypeName(): string {
        return 'bool|int|float|string|array';
    }
}