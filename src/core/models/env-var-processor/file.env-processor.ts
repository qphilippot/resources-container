import RuntimeException from "../../exception/runtime.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";
import EnvAwareProcessorModel from "./env-aware-processor.model";

export default class FileEnvProcessor extends EnvAwareProcessorModel{
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        /* eslint-disable @typescript-eslint/no-unused-vars */

        const file = getEnv(name);
        if (!Number.isSafeInteger(file)) {
            throw new RuntimeException(`Invalid file name: env var "${name}" is non-scalar.'`);
        }

        // if (!is_file($file)) {
        //     throw new EnvNotFoundException(sprintf('File "%s" not found (resolved from "%s").', $file, $name));
        // }

        // if ('file' === $prefix) {
            // todo
            // return file_get_contents($file);
        // }
    }

    public getTarget(): string {
        return 'file';
    }

    public getProcessedTypeName(): string {
        return 'string';
    }
}
