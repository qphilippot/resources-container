import ContainerBuilder from "../../src/core/container/container-builder.model";
import {ClassMetadata, generateClassesMetadata} from "../../src/generate-classes-metadata";
import {resolve} from "path";
import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";

export default class Launcher {
    private readonly container: ContainerBuilder;
    private readonly sourcePath: string;
    private projectFilesMetadata: Record<string, ClassMetadata>;
    private readonly projectNamespace: string;

    private readonly configManager = new ConfigLoaderManager('config-loader-manager');

    constructor(absoluteSourcePath: string, projectNameSpace: string = 'App') {
        this.sourcePath = absoluteSourcePath;
        this.container = new ContainerBuilder();

        this.projectNamespace = projectNameSpace;

        this.initializeConfigManager();
        this.analyseProjectFiles();
        this.initializeReflexionService();
        // this.addDefinitionFromMetadata();
    }

    private initializeConfigManager(): void {
        this.configManager.addHandler(new YamlContainerConfigLoader('yaml-config-loader'), 'yaml')
    }

    private analyseProjectFiles(): void {
        console.log("analuse project file", resolve(__dirname))
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
            console.log('==>', entry);
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
                .setAutowired(true)
                .setAbstract(value.abstract);
        });
    }

    public loadDefinitions(path: string): void {
        this.configManager.process({
            container: this.container,
            path
        });

        console.log("=== Container Definitions ===");
        console.log(this.container.getDefinitions());
// console.log(filepath);
//         const content = loader.process({
//             path: filepath,
//             container
//         });
    }

    public start(): void {
        // this.container.compile();

        console.log("=== Container Definitions (After compilation) ===");
        console.log(this.container.getDefinitions());
        const mainClass = this.container.get('App/src/MainClass');
        console.log(this.container.getReflexionService());
        console.log(mainClass);
        console.log(mainClass.hello());
    }
}
