import CompilerInterface from "./compiler.interface";
import ContainerInterface from "./container.interface";
import ResourceDefinition from "../models/resource-definition.model";
import ReflexionService from "../reflexion/reflexion.service";

interface ContainerBuilderInterface extends ContainerInterface {
    compiler: CompilerInterface;
    getCompiler(): CompilerInterface;
    getContainer(): ContainerInterface;

    getDefinitions(): Array<ResourceDefinition>;

    getReflexionService(): ReflexionService;

    /**
     * Gets a resource definition.
     *
     * @returns {ResourceDefinition} A Definition instance
     *
     * @throws {ResourceNotFoundException} if the service definition does not exist
     */
    getDefinition(definitionId: string): ResourceDefinition;


    register(id: string, aClass: InstanceType<any> | undefined): ResourceDefinition;


    addResource(resource, id: string);
    compile();
    isCompiled(): boolean;
}

export default ContainerBuilderInterface;