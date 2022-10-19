import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import {isValidDefinitionId} from "../../container/container.helper";

/**
 * Replace literal definition class name by related class type.
 * If no class set but some reflection class matches with definition id set empty definition class to related class.
 */

export default class ResolveClassPass implements CompilerPassInterface {
    public process(container: ContainerBuilderInterface) {
        container.getDefinitions().forEach(definition => {
            if (
                definition.isSynthetic() ||
                (definition.getResourceType() !== null && typeof definition.getResourceType() !== 'undefined')
            ) {
                return;
            }

            if (isValidDefinitionId(definition.getId())) {
                const _class = container.getReflectionService().findClass(definition.getId()) ?? null;

                // if (
                // // todo check childDefinition
                //     // && todo check if class exists (with reflexion service)
                // ) {
                //     throw new InvalidArgumentException(
                //         `Service definition "${definition.getId()}" has a parent but no class, and its name looks like an FQCN. Either the class is missing or you want to inherit it from the parent service. To resolve this ambiguity, please rename this service to a non-FQCN (e.g. using dots), or create the missing class.`
                //     );
                // }


                definition.setResourceType(_class);
            }
        });
    }
}
