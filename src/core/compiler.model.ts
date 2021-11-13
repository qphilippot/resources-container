import CompilerInterface from "./interfaces/compiler.interface";
import ContainerBuilderInterface from "./interfaces/container-builder.interface";
import CompilerPassInterface from "./interfaces/compiler-pass.interface";
import { DEFAULT_COMPILER_STEP } from './compiler-step.enum'
import { Publisher } from '@qphi/publisher-subscriber';
import PassesManager from "./passes-manager.model";
import {PASS_ADDED, STEP_ADDED} from "./compiler.notification";

class Compiler extends Publisher implements CompilerInterface {
    private passesManager: PassesManager = new PassesManager('passes-manager');
    private steps: Array<string> = [];

    constructor() {
        super('compiler-publisher');

        this.getInitialsSteps().forEach(step => {
            this.addStep(step);
        });
    }

    addStep(step: string) {
        this.steps.push(step);
        this.passesManager.recordStep(step, this);
        this.publish(STEP_ADDED, step);
    }

    getInitialsSteps(): Array<string> {
        return Object.values(DEFAULT_COMPILER_STEP);
    }

    getSteps(): Array<string> {
        return this.steps.slice(0);
    }

    compile(containerBuilder: ContainerBuilderInterface) {
        this.steps.forEach(async step => {
            await this.publish(step, containerBuilder);
        });
    }

    getPasses(): CompilerPassInterface[] {
        return this.passesManager.getPasses();
    }

    addPass(pass: CompilerPassInterface, step: string, priority: number = 0) {
        this.passesManager.addPass(pass, step, priority);
        this.publish(PASS_ADDED, { pass, step, priority });
    }
}



export default Compiler;