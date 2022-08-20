import ContainerBuilder from "../../src/core/container/container-builder.model";
import {ClassMetadata, CodeElementMetadata, generateClassesMetadata} from "../../src/generate-classes-metadata";
import {resolve} from "path";
import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import DefaultContainer from "../../src/core/container/default-container.model";
import ContainerInterface from "../../src/core/interfaces/container.interface";
import Reference from "../../src/core/models/reference.model";

export default class Launcher {
    private readonly container: ContainerBuilder;
    private readonly sourcePath: string;
    private projectFilesMetadata: Record<string, CodeElementMetadata>;
    private readonly projectNamespace: string;

    private readonly configManager = new ConfigLoaderManager('config-loader-manager');

    constructor(absoluteSourcePath: string, projectNameSpace: string = 'App') {
        this.sourcePath = absoluteSourcePath;
        this.container = new DefaultContainer();

        this.projectNamespace = projectNameSpace;

        this.initializeConfigManager();
        this.analyseProjectFiles();
        this.initializeReflexionService();
    }

    private initializeConfigManager(): void {
        this.configManager.addHandler(new YamlContainerConfigLoader('yaml-config-loader'), 'yaml')
    }

    private analyseProjectFiles(): void {
        this.projectFilesMetadata = generateClassesMetadata({
            path: this.sourcePath,
            debug: process.env.NODE_ENV === 'dev',
            aliasRules: [
                {
                    replace: resolve(__dirname),
                    by: this.projectNamespace
                }
            ]
        });
    }

    private initializeReflexionService(): void {
        const reflexionService = this.container.getReflexionService();
        Object.keys(this.projectFilesMetadata).forEach(entry => {
            const value = this.projectFilesMetadata[entry];
            let _constructor;

            if (value.export.type === 'export:default') {
                _constructor = require(value.export.path).default;
            }
            if (value.export.type === 'export:named') {
                _constructor = require(value.export.path)[value.name];
            }

            reflexionService.recordClass(entry, _constructor);
        });
    }

    private addDefinitionFromMetadata(): void {
        Object.keys(this.projectFilesMetadata).forEach(entry => {
            const value = this.projectFilesMetadata[entry];
            const definition = this.container.register(entry, entry);


            definition
                .setFilePath(value.export.path)
                .setAutowired(true);

            if (value.kind === 'class') {
                const valueAsClass = value as ClassMetadata;
                definition.setAbstract(valueAsClass.abstract);

                // check constructor arguments in order to add arguments
                valueAsClass.constructor?.forEach((param, index) => {
                    definition.setArgument(index, new Reference(param.namespace ?? param.type ?? param.name));
                });
            }
        });
    }

    public loadDefinitions(path: string): void {
        this.configManager.process({
            container: this.container,
            path
        });
    }

    public start(useConsole = true): void {
        this.container.compile();

        const mainClass = this.container.get('App/src/MainClass');

        if (useConsole) {
            console.log(mainClass.hello());
        }
    }

    public getContainer(): ContainerInterface {
        return this.container;
    }
}
