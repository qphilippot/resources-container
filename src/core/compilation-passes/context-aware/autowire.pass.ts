import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";

/**
 * Inspects existing service definitions and wires the autowired ones using the type hints of their classes.
 */
export default class AutowirePass implements CompilerPassInterface {
    protected builder: ContainerBuilderInterface;

    process(builder: ContainerBuilderInterface): void {
        const definitions = builder.getDefinitions();

        for (const definition of definitions) {

        }
    }

    private autowireAlias(builder: ContainerBuilderInterface): void {
        const aliases = builder.getAliases();

        Object.keys(aliases).forEach(alias => {

        });
    }
}
