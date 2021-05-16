import CompilerPassInterface from "./interfaces/compiler-pass.interface";
import Collection from "./models/collection.model";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import Subscriber from "../publisher-subscriber/model/subscriber.model";
import ContainerBuilderInterface from "./interfaces/container-builder.interface";
import PublisherInterface from "../publisher-subscriber/interfaces/publisher.interface";

class PassesManager extends Subscriber {
    passesByStep: Collection;

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

export default PassesManager;