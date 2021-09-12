import BadDefinitionValidityException from "../../exception/passes/bad-definition-validity.exception";
import ResourceDefinition from "../../models/resource-definition.model";

export function syntheticServiceMustBePublic(definition: ResourceDefinition) {
    if (definition.isSynthetic() && !definition.isPublic()) {
        throw new BadDefinitionValidityException(
            `A synthetic service ("${definition.getId()}") must be public.`
        );
    }
}

export function tagsAttributesValuesMustBeScalar(definition: ResourceDefinition) {
    const tags = definition.getTags();
    Object.values(tags).forEach(tag => {
        const attributesName = Object.keys(tag);
        const attributesValues = Object.values(tag);
        attributesValues.forEach((value, index) => {
            if (typeof value === 'object' && value !== null) {
                throw new BadDefinitionValidityException(
                    `A "tags" attribute must be of a scalar-type for service "${definition.getId()}", tags "${attributesName[index]}".`
                );
            }
        })
    });
}
