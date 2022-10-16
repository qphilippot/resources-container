import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import {isValidDefinitionId} from "../../container/container.helper";

/**
 * Replace literal definition class name by related class type
 */

//Replace definition with missing class by a class with same name that definition id or throw an error if no class match
export default class ResolveClassPass implements CompilerPassInterface
{
    public process(container: ContainerBuilderInterface) {
        container.getDefinitions().forEach(definition => {
            if (definition.isSynthetic() || definition.getResourceType() !== null) {
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
