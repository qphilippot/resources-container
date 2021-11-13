import CompilerPassInterface from "../../../src/core/interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../../src/core/interfaces/container-builder.interface";

export default class FooCompilerPass implements CompilerPassInterface {
    process(containerBuilder: ContainerBuilderInterface) {
        console.log('FooCompilerPass');
    }
}