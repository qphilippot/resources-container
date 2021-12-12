import ContainerBuilderInterface from "./container-builder.interface";
import CompilerPassInterface from "./compiler-pass.interface";

interface CompilerInterface {
    compile(containerBuilder: ContainerBuilderInterface);
    addPass(pass: CompilerPassInterface, step: string, priority: number);
    getPasses(): CompilerPassInterface[];
    addStep(step: string);
}

export default CompilerInterface;
