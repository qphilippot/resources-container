import RuntimeException from "../../exception/runtime.exception";
import EnvNotFoundException from "../../exception/env-not-found.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class DefaultEnvProcessor extends EnvAwareProcessorModel{
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const i = name.indexOf(':');

        if (i < 0) {
            throw new RuntimeException(`Invalid env "default:${name}": a fallback parameter should be provided.`);
        }

        const next = name.substr(i + 1);
        const _default = name.substr(0, i);

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

    public getTarget(): string {
        return 'default';
    }

    public getProcessedTypeName(): string {
        return 'bool|int|float|string|array';
    }
}
