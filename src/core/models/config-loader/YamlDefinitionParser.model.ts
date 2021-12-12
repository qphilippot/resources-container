import InvalidArgumentException from "../../exception/invalid-argument.exception";
import Alias from "../alias.model";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";

export default class YamlDefinitionParser {
    private container: ContainerBuilderInterface;

    setContainer(container: ContainerBuilderInterface) {
        this.container = container;
    }

    checkResourceIdSanity(id: string) {
        if (id.match(/^_[a-zA-Z0-9_]*$/)) {
            throw new InvalidArgumentException(
                `Resource names that start with an underscore are reserved. Rename the "${id}" service.`
            );
        }
    }
    parse(id: string, resource: object | string | null, path: string, defaults = {}, shouldReturn = false) {
        this.checkResourceIdSanity(id);

        if (typeof resource === 'string' && resource.startsWith('@')) {
            const alias = new Alias(resource.substring(1));

            if (typeof defaults['public'] === 'boolean') {
                alias.setPublic(defaults['public']);
            }

            return shouldReturn ? alias : this.container.setAlias(id, alias);
        }


    }
}
