import EnvVarProcessorInterface from "../interfaces/env-var-processor.interface";
import ContainerInterface from "../interfaces/container.interface";
import EnvVarLoaderInterface from "../interfaces/env-var-loader.interface";
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


    public getProvidedTypes() {
        const types = {};
        this.processors.forEach(processor => {
           types[processor.getTarget()] = processor.getProcessedTypeName()
        });

        return types;
    }

    public getContainer(): ContainerInterface {
        return this.container;
    }

    public getLoadedVar() {
        return this.loadedVars;
    }

    public getLoaders() {
        return this.loaders;
    }

    public getEnv(prefix: string, name: string, getEnv: Function) {
        const processor = this.processors.find(p => p.match(prefix));
        if (typeof processor === 'undefined') {
            throw new EnvProcessorNotFoundException(`Unsupported env var prefix "${prefix}".`);
        } else {
            return processor.process(prefix, name, getEnv, this);
        }
    }

    public addProcessor(processor: EnvVarProcessorInterface): this {
        this.processors.push(processor);
        return this;
    }

    public addProcessors(processors: EnvVarProcessorInterface[]): this {
        processors.forEach(processor => {
            this.processors.push(processor);
        });

        return this;
    }
}
