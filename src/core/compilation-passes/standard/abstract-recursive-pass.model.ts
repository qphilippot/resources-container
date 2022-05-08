import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import Definition from "../../models/definition.model";

export default abstract class AbstractRecursivePassModel implements CompilerPassInterface {
    protected containerBuilder: ContainerBuilderInterface;
    protected currentId: string;

    process(containerBuilder: ContainerBuilderInterface): void {
        this.containerBuilder = containerBuilder;
        try {
            this.processValue(containerBuilder.getDefinitions(), true);
        }
        catch (error) {
            console.error(error);
            throw error;
        }

    }

    /**
     * Processes a value found in a definition tree.
     *
     * @param {Object} value
     * @param {boolean} isRoot
     * @returns {Object} The processed value
     */
    protected processValue(value: any, isRoot: boolean = false): any {
        if (Array.isArray(value)) {
            value.forEach((v, k) => {
               if (isRoot) {
                   this.currentId = k.toString();
               }

               const processedValue = this.processValue(v, isRoot);
               if (v !== processedValue) {
                   value[k] = processedValue;
               }
            });
        }
        else if (value instanceof Definition) {
            value.setArguments(this.processValue(value.getArguments()));
            value.setInjectionProperties(this.processValue(value.getInjectionProperties()));
            value.setMethodCalls(this.processValue(value.getMethodCalls()));

            if (value.hasFactory()) {
                value.setFactory(this.processValue(value.getFactory()));
            }
        }
        // cannot check "instanceof Argument interface"
        else if (
            typeof value === 'object' && value !== null &&
            typeof value['setValues'] === 'function' &&
            typeof value['getValues'] === 'function'
        ) {
            value.setValues(this.processValue(value.getValues()));
        }
        else if (typeof value === 'object' && value !== null) {
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



        return value;
    }
}
