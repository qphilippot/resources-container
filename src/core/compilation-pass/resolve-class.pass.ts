/**
 * @author Nicolas Grekas <p@tchwork.com>
 */
import CompilerPassInterface from "../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../interfaces/container-builder.interface";

export default class ResolveClassPass implements CompilerPassInterface
{
    public process(container: ContainerBuilderInterface) {
        container.getDefinitions().forEach(definition => {
            if (definition.getResourceType() === null) {
                definition.setResourceType(definition.getId());
            }
        });
    }
};
