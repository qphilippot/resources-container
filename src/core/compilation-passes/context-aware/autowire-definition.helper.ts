import Definition from "../../models/definition.model";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import RuntimeException from "../../exception/runtime.exception";

export const getConstructor = (definition: Definition, isRequired: boolean, container: ContainerBuilderInterface) => {
    if (definition.isSynthetic()) {
        return null;
    }

    const factory = definition.getFactory();

    if (typeof factory === 'string') {
        // todo / reflection is too weak for now
    }

    const reflectionService = container.getReflexionService();
    const resourceConstructorMetadata = reflectionService.getConstructorOf(definition.getResourceType());

    if (typeof resourceConstructorMetadata === 'undefined') {
        // todo fix error message
        throw new RuntimeException(`Invalid service "${definition.getId()}": class "${undefined}" has no constructor.`);
    }
    // todo check if constructor is public

    return definition.getResourceType().constructor;
    // if ()
}
