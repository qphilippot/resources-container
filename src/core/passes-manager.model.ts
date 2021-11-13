import CompilerPassInterface from "./interfaces/compiler-pass.interface";
import Collection from "./models/collection.model";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import {Subscriber, PublisherInterface} from '@qphi/publisher-subscriber';
import ContainerBuilderInterface from "./interfaces/container-builder.interface";


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
    passesByStep: Collection<Record<string, CompilerPassInterface[]>> = new Collection();

    recordStep(step: string, compiler: PublisherInterface) {
        if (!this.passesByStep.has(step)) {
            this.passesByStep.add(step, {});
        }

        this.subscribe(
            compiler,
            step,
            (containerBuilder: ContainerBuilderInterface) => {
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
        } else {
            recordedSteps[priority] = [pass];
        }

        this.passesByStep.add(step, recordedSteps);
    }

    getSteps(): string[] {
        return this.passesByStep.keys();
    }

    getPasses(): CompilerPassInterface[] {
        const passes: CompilerPassInterface[] = [];
        this.passesByStep.keys().forEach(key => {
                const step = this.passesByStep.get(key);
                const priorities = Object.keys(step).sort((a, b) => parseInt(b) - parseInt(a));

                priorities.forEach(priority => {
                    step[priority].forEach((pass: CompilerPassInterface) => passes.push(pass))
                });
            }
        );

        return passes;
    }
}
