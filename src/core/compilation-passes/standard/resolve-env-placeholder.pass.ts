import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import Definition from "../../models/definition.model";

/**
 * Replaces all references to aliases with references to the actual service.
 */
export default class ResolveEnvPlaceholderPass extends AbstractRecursivePassModel implements CompilerPassInterface {
    protected processValue(value: any, isRoot: boolean = false): any {
        if (typeof value === 'string') {
            return this.containerBuilder.resolveEnvPlaceholders(value, true);
        }

        if (value instanceof Definition) {
            const changes = value.getChanges();
            if (typeof changes['type'] !== 'undefined') {
                value.setResourceType(
                    this.containerBuilder.resolveEnvPlaceholders(value.getResourceType(), true)
                );
            }

            if (typeof changes['file'] !== 'undefined') {
                value.setFilePath(
                    this.containerBuilder.resolveEnvPlaceholders(value.getFilePath(), true) as unknown as string
                );
            }
        }

        value = super.processValue(value, isRoot);

        if (Array.isArray(value) && !isRoot) {
            value = [
                ...this.containerBuilder.resolveEnvPlaceholders(Object.keys(value), true) as Array<any>,
                value
            ]
        }

        return value;
    }
}
