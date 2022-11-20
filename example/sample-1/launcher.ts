import ContainerBuilder from "../../src/core/container/container-builder.model";
import {join, resolve} from "path";
import type {ReflectionClassInterface} from "reflection-service";
import {ProjectAnalyzer, ProjectMetadata, ReflectionMethodInterface} from "reflection-service";


import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import DefaultContainer from "../../src/core/container/default-container.model";
import ContainerInterface from "../../src/core/interfaces/container.interface";
import Reference from "../../src/core/models/reference.model";
import TsDumperService from "../../src/core/dumper/TsDumperService";


export default class Launcher {
    private readonly container: ContainerBuilder;
    private readonly sourcePath: string;
    private projectFilesMetadata: ProjectMetadata;
    private readonly projectNamespace: string;

    private readonly configManager = new ConfigLoaderManager('config-loader-manager');

    constructor(absoluteSourcePath: string, projectNameSpace: string = 'App') {
        this.sourcePath = absoluteSourcePath;
        this.container = new DefaultContainer();

        this.projectNamespace = projectNameSpace;

        this.initializeConfigManager();

    }

    public async setup() {
        await this.analyseProjectFiles();
        this.initializeReflectionService();
    }

    private initializeConfigManager(): void {
        this.configManager.addHandler(new YamlContainerConfigLoader('yaml-config-loader'), 'yaml')
    }

    private async analyseProjectFiles(): Promise<void> {
        this.projectFilesMetadata = await ProjectAnalyzer.analyze({
            path: this.sourcePath,
            debug: process.env.NODE_ENV === 'dev',
            aliasRules: [
                {
                    replace: resolve(__dirname),
                    by: this.projectNamespace
                }
            ]
        })
    }

    private initializeReflectionService(): void {
        const reflectionService = this.container.getReflectionService();

        this.projectFilesMetadata.classes.forEach((_class: ReflectionClassInterface) => {
            reflectionService.addReflectionClass(_class);
            reflectionService.recordClass(_class.getName(), _class.getClass());
        });

        this.projectFilesMetadata.interfaces.forEach(_interface => {
            reflectionService.addReflectionInterface(_interface);
        });
    }

    private addDefinitionFromMetadata(): void {
        this.projectFilesMetadata.classes.forEach((entry: ReflectionClassInterface) => {
            const definition = this.container.register(entry.getName(), entry.getClass());


            definition
                .setFilePath(entry.getFilePath())
                .setAutowired(true);

            definition.setAbstract(entry.isAbstract());
            const _constructor: ReflectionMethodInterface = entry.getMethod('constructor');
            // check constructor arguments in order to add arguments
            _constructor?.getParameters().forEach((param, index) => {
                definition.setArgument(
                    index,
                    // todo
                    new Reference(param.getName()));
            });
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

        TsDumperService.dump(
            this.container,
            join(__dirname, './dumped_container.ts')
        );
    }

    public getContainer(): ContainerInterface {
        return this.container;
    }
}
