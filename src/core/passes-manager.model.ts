import CompilerPassInterface from "./interfaces/compiler-pass.interface";
import Collection from "./models/collection.model";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import Subscriber from "../publisher-subscriber/model/subscriber.model";
import ContainerBuilderInterface from "./interfaces/container-builder.interface";
import PublisherInterface from "../publisher-subscriber/interfaces/publisher.interface";


//  $this->beforeOptimizationPasses = [
//             100 => [
//                 new ResolveClassPass(),
//                 new RegisterAutoconfigureAttributesPass(),
//                 new AttributeAutoconfigurationPass(),
//                 new ResolveInstanceofConditionalsPass(),
//                 new RegisterEnvVarProcessorsPass(),
//             ],
//             -1000 => [new ExtensionCompilerPass()],
//         ];
//
//         $this->optimizationPasses = [[
//             new AutoAliasServicePass(),
//             new ValidateEnvPlaceholdersPass(),
//             new ResolveDecoratorStackPass(),
//             new ResolveChildDefinitionsPass(),
//             new RegisterServiceSubscribersPass(),
//             new ResolveParameterPlaceHoldersPass(false, false),
//             new ResolveFactoryClassPass(),
//             new ResolveNamedArgumentsPass(),
//             new AutowireRequiredMethodsPass(),
//             new AutowireRequiredPropertiesPass(),
//             new ResolveBindingsPass(),
//             new DecoratorServicePass(),
//             new CheckDefinitionValidityPass(),
//             new AutowirePass(false),
//             new ServiceLocatorTagPass(),
//             new ResolveTaggedIteratorArgumentPass(),
//             new ResolveServiceSubscribersPass(),
//             new ResolveReferencesToAliasesPass(),
//             new ResolveInvalidReferencesPass(),
//             new AnalyzeServiceReferencesPass(true),
//             new CheckCircularReferencesPass(),
//             new CheckReferenceValidityPass(),
//             new CheckArgumentsValidityPass(false),
//         ]];
//
//         $this->removingPasses = [[
//             new RemovePrivateAliasesPass(),
//             new ReplaceAliasByActualDefinitionPass(),
//             new RemoveAbstractDefinitionsPass(),
//             new RemoveUnusedDefinitionsPass(),
//             new AnalyzeServiceReferencesPass(),
//             new CheckExceptionOnInvalidReferenceBehaviorPass(),
//             new InlineServiceDefinitionsPass(new AnalyzeServiceReferencesPass()),
//             new AnalyzeServiceReferencesPass(),
//             new DefinitionErrorExceptionPass(),
//         ]];
//
//         $this->afterRemovingPasses = [[
//             new ResolveHotPathPass(),
//             new ResolveNoPreloadPass(),
//             new AliasDeprecatedPublicServicesPass(),
//         ]];

export default class PassesManager extends Subscriber {
    passesByStep: Collection = new Collection();

    recordStep(step: string, compiler: PublisherInterface) {
        if (!this.passesByStep.has(step)) {
            this.passesByStep.add(step, {});
        }

        this.subscribe(
            compiler,
            step,
            (containerBuilder: ContainerBuilderInterface)  => {
                const passesByPriority = this.passesByStep.get(step);
                const prioritiesAvailables = Object.keys(passesByPriority);
                prioritiesAvailables.sort((a, b) => parseInt(a) - parseInt(b));

                prioritiesAvailables.forEach(priority => {
                    passesByPriority[priority].forEach(passe => passe.process(containerBuilder));
                });
            }
        )
    }

    addPass(pass: CompilerPassInterface, step: string, priority: number = 0) {
        if (!this.passesByStep.has(step)) {
            throw new InvalidArgumentException(
                `Unable to add pass. Are you sure that ${step} step is enabled ?`
            );
        }

        const recordedSteps = this.passesByStep.get(step);

        if (Array.isArray(recordedSteps[priority])) {
            recordedSteps[priority].push(pass);
        }

        else {
            recordedSteps[priority] = [ pass ];
        }

        this.passesByStep.add(step, recordedSteps);
    }
}
