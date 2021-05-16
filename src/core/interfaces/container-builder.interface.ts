import CompilerInterface from "./compiler.interface";
import ContainerInterface from "../../../psr/container/container.interface";

interface ContainerBuilderInterface extends ContainerInterface {
    compiler: CompilerInterface;
    getCompiler(): CompilerInterface;
    getContainer(): ContainerInterface;

    addResource(resource, id: string);
    compile();
}

export default ContainerBuilderInterface;