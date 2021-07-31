import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import ResourceDefinition from "../../models/resource-definition.model";

export default abstract class AbstractRecursivePassModel implements CompilerPassInterface {
    protected containerBuilder: ContainerBuilderInterface;
    protected currentId: string;

    process(containerBuilder: ContainerBuilderInterface): void {
        this.containerBuilder = containerBuilder;
        this.processValue(containerBuilder.getDefinitions(), true);
    }

    /**
     * Processes a value found in a definition tree.
     *
     * @param {Object} value
     * @param {boolean} isRoot
     * @returns {Object} The processed value
     */
    protected processValue(value: any, isRoot: boolean = false): any {
        if (typeof value === 'object' && value !== null) {
            Object.keys(value).forEach(key => {
                if (isRoot) {
                    this.currentId = key;
                }

                const entry = value[key];
                const processedValue = this.processValue(entry, isRoot);

                if (entry !== processedValue) {
                    value[key] = processedValue;
                }
            });
        }

        // cannot check "instanceof Argument interface"
        else if (
            typeof value === 'object' && value !== null &&
            typeof value['setValues'] === 'function' &&
            typeof value['getValues'] === 'function'
        ) {
            value.setValues(this.processValue(value.getValues()));
        }
        // todo support expression
        else if (value instanceof ResourceDefinition) {
            value.setArguments(this.processValue(value.getArguments()));
            value.setMethodCalls(this.processValue(value.getMethodCalls()));
        }

        return value;
    }
}