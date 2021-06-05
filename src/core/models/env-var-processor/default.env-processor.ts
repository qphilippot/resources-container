import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import RuntimeException from "../../exception/runtime.exception";
import EnvNotFoundException from "../../exception/env-not-found.exception";
import ContainerInterface from "../../interfaces/container.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class DefaultEnvProcessor extends EnvAwareProcessorModel{
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const i = name.indexOf(':');

        if (i < 0) {
            throw new RuntimeException(`Invalid env "default:${name}": a fallback parameter should be provided.`);
        }

        let next = name.substr(i + 1);
        let _default = name.substr(0, i);

        const container = manager.getContainer();
        if (_default && container.hasParameter(_default)) {
            throw new RuntimeException(
                `Invalid env fallback in "default:${name}": parameter "${_default}" not found.`
            );
        }

        try {
            const env = getEnv(next);
            if (env !== '' && env !== null) {
                return env;
            }
        } catch (err) {
            if (err instanceof EnvNotFoundException) {
                // no-op
            } else {
                throw err;
            }
        }

        return _default === null ? null : container.getParameter(_default);

    }

    getTarget(): string {
        return 'default';
    }

    getProcessedTypeName(): string {
        return 'bool|int|float|string|array';
    }
}