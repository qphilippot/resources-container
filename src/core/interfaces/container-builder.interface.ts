import CompilerInterface from "./compiler.interface";
import ContainerInterface from "./container.interface";
import ResourceDefinition from "../models/resource-definition.model";

interface ContainerBuilderInterface extends ContainerInterface {
    compiler: CompilerInterface;
    getCompiler(): CompilerInterface;
    getContainer(): ContainerInterface;

    getDefinitions(): Array<ResourceDefinition>;

    addResource(resource, id: string);
    compile();
}

export default ContainerBuilderInterface;