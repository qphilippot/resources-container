import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import ContainerHelper from "../../container.helper";
import Reference from "../../models/reference.model";

/**
 * Replaces all references to aliases with references to the actual service.
 */
export default class ResolveReferencesToAliasesPass extends AbstractRecursivePassModel implements CompilerPassInterface
{
    public process(containerBuilder: ContainerBuilderInterface) {
        super.process(containerBuilder);
        const aliases = containerBuilder.getAliases();

        Object.keys(aliases).forEach(alias => {
            const aliasId = aliases[alias];
            this.currentId = alias;

            const definitionId: string = this.getDefinitionId(aliasId, containerBuilder);
            if (aliasId !== definitionId) {
                containerBuilder.setAlias(alias, definitionId);
            }
        });
    }

    private getDefinitionId(id: string, containerBuilder: ContainerBuilderInterface): string {
        if (!containerBuilder.hasAlias(id)) {
            return id;
        }

        return ContainerHelper.resolveAlias(id, containerBuilder);
    }

    protected processValue(value: any, isRoot: boolean = false): any {
        if (!(value instanceof Reference)) {
            return super.processValue(value, isRoot);
        }

        else {
            const id: string = value.toString();
            const definitionId = this.getDefinitionId(id, this.containerBuilder);

            if (definitionId !== id) {
                return new Reference(definitionId);
            }

            else {
                return value;
            }
        }
    }
};
