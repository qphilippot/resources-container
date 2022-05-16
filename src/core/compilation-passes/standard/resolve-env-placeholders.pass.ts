import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import Definition from "../../models/definition.model";

/**
 * Replaces env var placeholders by their current values.
 */
export default class ResolveEnvPlaceholdersPass extends AbstractRecursivePassModel implements CompilerPassInterface {
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

        if (typeof value === 'object' && value !== null && !isRoot && Object.keys(value).length > 0) {
            const resolved = this.containerBuilder.resolveEnvPlaceholders(value, true) as Array<any>;
           value = {
                ...value,
                ...resolved
            }
        }


        return value;
    }
}
