import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";

export default class MergeExtensionPass implements CompilerPassInterface {
    /**
     * @inheritDoc
     */
    public process(containerBuilder: ContainerBuilderInterface) {
        const parameters = containerBuilder.getParameterBag().all();
        const definition = containerBuilder.getDefinitions();
        const aliases = containerBuilder.getAliases();

        // todo merge expression
        // $exprLangProviders = $container->getExpressionLanguageProviders();

        // todo BaseNode process

    }
}
