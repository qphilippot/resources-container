import EnvVarProcessorInterface from "../../interfaces/env-var-processor.interface";
import ContainerInterface from "../../interfaces/container.interface";
import RuntimeException from "../../exception/runtime.exception";
import EnvNotFoundException from "../../exception/env-not-found.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";

export default class FileEnvProcessor implements EnvVarProcessorInterface {
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
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

    match(prefix: string): boolean {
        return prefix === 'file';
    }

    getProcessedTypeName(): string {
        return 'string';
    }
}