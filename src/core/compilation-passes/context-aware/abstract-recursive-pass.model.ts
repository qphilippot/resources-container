import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import ResourceDefinition from "../../models/resource-definition.model";
import AbstractRecursivePassModel from "../standard/abstract-recursive-pass.model";

export default abstract class ContextAwareAbstractRecursivePassModel extends AbstractRecursivePassModel{
    protected getConstructor(definition: ResourceDefinition, required: boolean) {
        if (definition.isSynthetic()) {
            return null;
        }

        const factory = definition.getFactory();

        if (typeof factory === 'string') {
            // todo / reflection is too weak for now
        }

        // if ()
    }

    protected getReflectionMethod(definition: ResourceDefinition, method: string) {
        if (method === 'constructor') {
            return this.getConstructor(definition, true);
        }
    }
}