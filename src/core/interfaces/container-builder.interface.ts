import CompilerInterface from "./compiler.interface";
import ContainerInterface from "./container.interface";
import Definition from "../models/definition.model";
import ReflexionService from "../reflexion/reflexion.service";

interface ContainerBuilderInterface extends ContainerInterface {
    getCompiler(): CompilerInterface;

    getDefinitions(): Array<Definition>;
    hasDefinition(definitionId:string):boolean;

    getReflexionService(): ReflexionService;

    /**
     * Gets a resource definition.
     *
     * @returns {Definition} A Definition instance
     *
     * @throws {ResourceNotFoundException} if the service definition does not exist
     */
    getDefinition(definitionId: string): Definition;


    register(id: string, aClass: InstanceType<any> | undefined): Definition;
    compile();
    isCompiled(): boolean;
}

export default ContainerBuilderInterface;
