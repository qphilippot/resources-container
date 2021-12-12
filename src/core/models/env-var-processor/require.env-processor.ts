import RuntimeException from "../../exception/runtime.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class RequireEnvProcessor extends EnvAwareProcessorModel{
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface): void {
        /* eslint-enable @typescript-eslint/ban-types,  @typescript-eslint/no-unused-vars */
        const file = getEnv(name);
        if (!Number.isSafeInteger(file)) {
            throw new RuntimeException(`Invalid file name: env var "${name}" is non-scalar.'`);
        }

        // if (!is_file($file)) {
        //     throw new EnvNotFoundException(sprintf('File "%s" not found (resolved from "%s").', $file, $name));
        // }

            // return require $file;

    }

    public getTarget(): string {
        return 'require';
    }

    public getProcessedTypeName(): string {
        return 'bool|int|float|string|array';
    }
}
