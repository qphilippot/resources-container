import EnvVarProcessorInterface from "../interfaces/env-var-processor.interface";
import ContainerInterface from "../interfaces/container.interface";
import EnvVarLoaderInterface from "../interfaces/env-var-loader.interface";
import RuntimeException from "../exception/runtime.exception";
import EnvVarProcessorManagerInterface from "../interfaces/env-var-processor-manager.interface";
import EnvProcessorNotFoundException from "../exception/env-processor-not-found.exception";

export default class EnvVarProcessorManager implements EnvVarProcessorManagerInterface {
    private container: ContainerInterface;
    private loaders: EnvVarLoaderInterface[];
    private processors: EnvVarProcessorInterface[];
    private loadedVars = [];

    constructor(
        container: ContainerInterface,
        loaders: EnvVarLoaderInterface[] = [],
        processors: EnvVarProcessorInterface[] = []
    ) {
        this.container = container;
        this.loaders = loaders;
        this.processors = processors;
    }


    getProvidedTypes() {
        const types = {};
        this.processors.forEach(processor => {
           types[processor.getTarget()] = processor.getProcessedTypeName()
        });

        return types;
    }

    getContainer(): ContainerInterface {
        return this.container;
    }

    getLoadedVar() {
        return this.loadedVars;
    }

    getLoaders() {
        return this.loaders;
    }

    getEnv(prefix: string, name: string, getEnv: Function) {
        let processor = this.processors.find(p => p.match(prefix));
        if (typeof processor === 'undefined') {
            throw new EnvProcessorNotFoundException(`Unsupported env var prefix "${prefix}".`);
        } else {
            return processor.process(prefix, name, getEnv, this);
        }
    }

    addProcessor(processor: EnvVarProcessorInterface) {
        this.processors.push(processor);
    }
}
