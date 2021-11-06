import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import BadDefinitionValidityException from "../../exception/passes/bad-definition-validity.exception";
import ResourceDefinition from "../../models/resource-definition.model";
import {syntheticServiceMustBePublic, tagsAttributesValuesMustBeScalar} from './check-definition-validity.helper';
import { Publisher } from "@qphi/publisher-subscriber";
/**
 * Processes the ContainerBuilder to validate the Definition.
 */
export default class CheckDefinitionValidityPass extends Publisher implements CompilerPassInterface {
    constructor() {
        super('check-definition-validity-pass' );
    }

    public process(containerBuilder: ContainerBuilderInterface) {
        const definitions = containerBuilder.getDefinitions();
        definitions.forEach(definition => {
            syntheticServiceMustBePublic(definition);
            // todo: only when reflector feature is enable, use hook PubSub in order to extends
            // non-synthetic and non-abstract service must have a class
            //    if (!$definition->isAbstract() && !$definition->isSynthetic() && !$definition->getClass() && !$definition->hasTag('container.service_locator') && (!$definition->getFactory() || !preg_match(FileLoader::ANONYMOUS_ID_REGEXP, $id))) {
            //                 if ($definition->getFactory()) {
            //                     throw new RuntimeException(sprintf('Please add the class to service "%s" even if it is constructed by a factory since we might need to add method calls based on compile-time checks.', $id));
            //                 }
            //                 if (class_exists($id) || interface_exists($id, false)) {
            //                     if (str_starts_with($id, '\\') && 1 < substr_count($id, '\\')) {
            //                         throw new RuntimeException(sprintf('The definition for "%s" has no class attribute, and appears to reference a class or interface. Please specify the class attribute explicitly or remove the leading backslash by renaming the service to "%s" to get rid of this error.', $id, substr($id, 1)));
            //                     }
            //
            //                     throw new RuntimeException(sprintf('The definition for "%s" has no class attribute, and appears to reference a class or interface in the global namespace. Leaving out the "class" attribute is only allowed for namespaced classes. Please specify the class attribute explicitly to get rid of this error.', $id));
            //                 }
            //
            //                 throw new RuntimeException(sprintf('The definition for "%s" has no class. If you intend to inject this service dynamically at runtime, please mark it as synthetic=true. If this is an abstract definition solely used by child definitions, please add abstract=true, otherwise specify a class to get rid of this error.', $id));
            //             }
            tagsAttributesValuesMustBeScalar(definition);

            // todo: quand j'aurais compris à quoi ça sert...
            // if ($definition->isPublic() && !$definition->isPrivate()) {
            //                 $resolvedId = $container->resolveEnvPlaceholders($id, null, $usedEnvs);
            //                 if (null !== $usedEnvs) {
            //                     throw new EnvParameterException([$resolvedId], null, 'A service name ("%s") cannot contain dynamic values.');
            //                 }
            //             }
            this.publish('check-definition-validity', definition);
        });

        const aliases = containerBuilder.getAliases();
        Object.values(alias => {
            // todo: même délire que pour les définitions
        //    if ($alias->isPublic() && !$alias->isPrivate()) {
            //                 $resolvedId = $container->resolveEnvPlaceholders($id, null, $usedEnvs);
            //                 if (null !== $usedEnvs) {
            //                     throw new EnvParameterException([$resolvedId], null, 'An alias name ("%s") cannot contain dynamic values.');
            //                 }
            //             }
        });
    }
}
