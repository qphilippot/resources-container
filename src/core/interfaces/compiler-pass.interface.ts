import ContainerBuilderInterface from "./container-builder.interface";

interface CompilerPassInterface {
    /**
     * You can modify the container here before compilation is over
     */
    process(containerBuilder: ContainerBuilderInterface);
}

export default CompilerPassInterface;