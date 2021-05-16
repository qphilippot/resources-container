import ContainerBuilderInterface from "./container-builder.interface";

interface CompilerInterface {
    compile(containerBuilder: ContainerBuilderInterface);
}

export default CompilerInterface;