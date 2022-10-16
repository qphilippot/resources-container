import ContainerBuilder from "../../src/core/container/container-builder.model";
import {resolve} from "path";
import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import DefaultContainer from "../../src/core/container/default-container.model";
import ContainerInterface from "../../src/core/interfaces/container.interface";
import Reference from "../../src/core/models/reference.model";

import {
    ProjectAnalyzer,
    ProjectMetadata,
    // @ts-ignore
    ReflectionClassInterface,
    // @ts-ignore
    ReflectionMethodInterface
} from "reflection-service";
import AutowirePass from "../../src/core/compilation-passes/context-aware/autowire.pass";
import {OPTIMIZATION} from "../../src/core/compiler-step.enum";

export default class Launcher {
    private readonly container: ContainerBuilder;
    private readonly sourcePath: string;
    private projectFilesMetadata: ProjectMetadata;
    private readonly projectNamespace: string;

    private readonly configManager = new ConfigLoaderManager('config-loader-manager');

    constructor(absoluteSourcePath: string, projectNameSpace: string = 'App') {
        this.sourcePath = absoluteSourcePath;
        this.container = new DefaultContainer();

        this.container.addCompilerPass(
            new AutowirePass(), OPTIMIZATION
        );

        this.projectNamespace = projectNameSpace;

        this.initializeConfigManager();
    }

    private initializeConfigManager(): void {
        this.configManager.addHandler(new YamlContainerConfigLoader('yaml-config-loader'), 'yaml')
    }

    public async setup() {
        await this.analyseProjectFiles();
        this.initializeReflectionService();
        this.addDefinitionFromMetadata();
    }

    private async analyseProjectFiles(): Promise<void> {
        // this.projectFilesMetadata = generateClassesMetadata({
        //     path: this.sourcePath,
        //     debug: true,
        //     aliasRules: [
        //         {
        //             replace: resolve(__dirname),
        //             by: this.projectNamespace
        //         }
        //     ]
        // });

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

        console.log(this.projectFilesMetadata);
        // console.log(this.projectFilesMetadata['App/src/HandlerB'])
    }

    private initializeReflectionService(): void {
        const reflectionService = this.container.getReflectionService();

        console.log(this.projectFilesMetadata);
        this.projectFilesMetadata.classes.forEach((_class: ReflectionClassInterface) => {
            reflectionService.addReflectionClass(_class);


            // if (_class.export.type === 'export:default') {
            //     _constructor = require(value.export.path).default;
            // }
            // if (_class.export.type === 'export:named') {
            //     _constructor = require(_class.export.path)[_class.name];
            // }

            reflectionService.recordClass(_class.getName(), _class.getClass());
        });

        this.projectFilesMetadata.interfaces.forEach(_interface => {
            reflectionService.addReflectionInterface(_interface);
        });

        // const inheritanceSchema = buildInheritanceTreeFromClassMetadataCollection(this.projectFilesMetadata);


        // reflectionService.setInheritanceTree(inheritanceSchema);
        // console.log('inheritanceSchema', inheritanceSchema);

    }

    private addDefinitionFromMetadata(): void {
        this.projectFilesMetadata.classes.forEach((entry: ReflectionClassInterface) => {
            const definition = this.container.register(entry.getName(), entry.getClass());


            definition.setPublic(true);

            definition
                .setFilePath(entry.getFilePath())
                .setAutowired(true);

            // if (value.kind === IS_CLASS) {

            definition.setAbstract(entry.isAbstract());

            if (entry.hasMethod('constructor')) {
                const _constructor: ReflectionMethodInterface = entry.getMethod('constructor');
                // check constructor arguments in order to add arguments
                _constructor?.getParameters().forEach((param, index) => {
                    console.log('set constructor param',param);
                    const itUseNamespace = param.getNamespacedName() != param.getName();
                    definition.setArgument(
                        index,
                        // todo
                        new Reference(
                            itUseNamespace ? param.getNamespacedName() : param.getType() ?? param.getName()
                        )
                    );
                });
            }

            // }
        });
    }

    public loadDefinitions(path: string): void {
        this.configManager.process({
            container: this.container,
            path
        });
    }

    public start(useConsole = true): void {
        // const reflectionService = this.container.getReflectionService();
        // const methodUsingDefaultValue = reflectionService.getReflectionMethod(
        //     reflectionService.findClass('App/src/HandlerB'),
        //     'methodUsingDefaultValue'
        // );
        //
        // const parameterWithDefaultValueReflectionParameter = methodUsingDefaultValue.getParameter('parameterWithDefaultValue');
        //
        // console.log(parameterWithDefaultValueReflectionParameter);

        // console.log(this.container.getDefinitions());
        // console.log(this.container.getDefinition('App/src/MainClass'));
        // console.log({ ...this.container.getDefinition('App/src/MainClass') })
        this.container.compile();
        // console.log(this.container.getDefinition('App/src/MainClass'));
        // console.log(this.container.getDefinitions());
        //
        // console.log(
        //     "Implementation of App/src/HandlerAInterface'",
        //     this.container.getReflectionService().getImplementationsOf('App/src/HandlerAInterface')
        // );
        //
        const mainClass = this.container.get('App/src/MainClass');
        //
        console.log(mainClass);
        // console.log(this.container.getDefinition('App/src/MainClass'));
        if (useConsole) {
            console.log(mainClass.hello());
        }
    }

    public getContainer(): ContainerInterface {
        return this.container;
    }
}
