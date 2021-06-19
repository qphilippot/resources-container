import CompilerPassInterface from "../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../interfaces/container-builder.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import { ContainerHelperSingleton } from "../container.helper";
import Reference from "../models/reference.model";

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

        const alias = containerBuilder.getAlias(id);

        // todo : not supported yet
        // if ($alias->isDeprecated()) {
        //     $referencingDefinition = $container->hasDefinition($this->currentId) ? $container->getDefinition($this->currentId) : $container->getAlias($this->currentId);
        //     if (!$referencingDefinition->isDeprecated()) {
        //         $deprecation = $alias->getDeprecation($id);
        //         trigger_deprecation($deprecation['package'], $deprecation['version'], rtrim($deprecation['message'], '. ').'. It is being referenced by the "%s" '.($container->hasDefinition($this->currentId) ? 'service.' : 'alias.'), $this->currentId);
        //     }
        // }


        return ContainerHelperSingleton.resolveAlias(id, containerBuilder);
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
