import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import { resolveAlias, checkDeprecation } from "../../container/container.helper";
import Reference from "../../models/reference.model";
import Alias from "../../models/alias.model";

/**
 * Replaces all references to aliases with references to the actual service.
 */
export default class ResolveReferencesToAliasesPass extends AbstractRecursivePassModel implements CompilerPassInterface
{
    public process(containerBuilder: ContainerBuilderInterface) {
        super.process(containerBuilder);

        const aliases: Record<string, Alias> = containerBuilder.getAliases();

        Object.keys(aliases).forEach(id => {
            const alias = aliases[id];
            const aliasId = alias.toString();
            this.currentId = id;

            const definitionId: string = this.getDefinitionId(aliasId, containerBuilder);
            if (aliasId !== definitionId) {
                containerBuilder.setAlias(id, new Alias(definitionId, alias.isPublic()));
            }
        });
    }

    private getDefinitionId(id: string, containerBuilder: ContainerBuilderInterface): string {
        if (!containerBuilder.hasAlias(id)) {
            return id;
        }

        checkDeprecation(id, containerBuilder);

        const resolved =  resolveAlias(id, containerBuilder);

        return resolved;
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
}
