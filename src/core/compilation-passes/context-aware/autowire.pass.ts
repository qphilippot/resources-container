import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import Definition from "../../models/definition.model";
import {getConstructor} from "./autowire-definition.helper";
import {CONSTRUCTOR_METHOD_NAME} from "../../reflexion/reflection-method.config";


/**
 * Inspects existing service definitions and wires the autowired ones using the type hints of their classes.
 */
export default class AutowirePass implements CompilerPassInterface {
    protected builder: ContainerBuilderInterface;

    process(builder: ContainerBuilderInterface): void {
        this.builder = builder;
        const definitions = builder.getDefinitions().filter(definition => {
            return (
                definition.isAutowired() &&
                !definition.isAbstract()
            );
        });



        this.autowireResourceType(definitions);
        this.autowireMethodCalls(definitions);
        // resolve resource type of definitions if needed

    }

    // todo
    private autowireResourceType(definitions: Definition[]): void {
        console.log('autowireResourceType', definitions);
        const target = definitions.filter(definition => typeof definition.getResourceType() === 'string');
        for (const definition of target) {
            const resolvedType = this.findResourceType(definition.getResourceType());

            if (typeof resolvedType === 'undefined') {
                console.log(`Skipping service "${definition.getId()}": Class or interface "${definition.getResourceType()}" cannot be loaded.`);
            }

            console.log('reflxion cvlass', resolvedType);
        }
    }

    // todo
    private autowireMethodCalls(definitions: Definition[]): void {
        for (const definition of definitions) {
            const methodCallsToResolve = definition.getMethodCalls();
            const _constructor = getConstructor(
                definition,
                false,
                this.builder
            );

            if (_constructor) {
                methodCallsToResolve.unshift(
                    [ CONSTRUCTOR_METHOD_NAME, definition.getArguments() ]
                );
            }


            this.resolveMethodCalls(definition, methodCallsToResolve);

            if (_constructor) {
                const resolvedConstructorCall = methodCallsToResolve.shift();
                const resolvedArguments = resolvedConstructorCall[1];

                if (resolvedArguments !== definition.getArguments()) {
                    // something has changed, replace old arguments value by resolved
                    definition.setArguments(resolvedArguments);
                }
            }
        }
    }

    private resolveMethodCalls(definition: Definition, callsToResolve: Array<any>): any[] {
        const shouldCheckAttributes = !definition.hasTag('container.ignore_attributes');
        // todo check decorated classes

        for (const call of callsToResolve) {
            const [methodName, argumentsProvided] = call;
            const reflexionMethod = this.builder.getReflexionService().getReflectionMethod(
                definition.getResourceType(),
                methodName
            );
        }

        // todo check variadic methods


        return []; // todo
    }

    private findResourceType(name: string): InstanceType<any> | undefined {
        return this.builder.getReflexionService().findClass(name);
    }

    private autowireAlias(builder: ContainerBuilderInterface): void {
        const aliases = builder.getAliases();

        Object.keys(aliases).forEach(alias => {

        });
    }
}
