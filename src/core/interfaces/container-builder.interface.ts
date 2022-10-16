import type CompilerInterface from "./compiler.interface";
import ContainerInterface from "./container.interface";
import type Definition from "../models/definition.model";
import type {ReflectionService} from "reflection-service";
import type ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import type MixedInterface from "../../utils/mixed.interface";

interface ContainerBuilderInterface extends ContainerInterface {
    getCompiler(): CompilerInterface;

    getDefinitions(): Array<Definition>;

    hasDefinition(definitionId: string): boolean;

    resolveEnvPlaceholders(value: any, format: string | boolean | null, usedEnvs?: any[]): MixedInterface;


    getReflectionService(): ReflectionService;

    /**
     * Gets a resource definition.
     *
     * @returns {Definition} A Definition instance
     *
     * @throws {ResourceNotFoundException} if the service definition does not exist
     */
    getDefinition(definitionId: string): Definition;
    setDefinition(definitionId: string, definition: Definition): void;
    getParameterBag(): ParameterBagInterface;

    register(id: string, aClass: InstanceType<any> | undefined): Definition;
    compile();
    isCompiled(): boolean;
}

export default ContainerBuilderInterface;
