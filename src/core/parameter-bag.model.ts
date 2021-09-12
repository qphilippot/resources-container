import MixedInterface from "../utils/mixed.interface";
import ParameterBagInterface from "./interfaces/parameter-bag.interface";
import ParameterNotFoundException from "./exception/parameter-not-found.exception";
import levenshtein from 'fast-levenshtein';

export default class ParameterBag implements ParameterBagInterface {
    protected parameters: MixedInterface = {};
    protected resolved: boolean = false;

    constructor(parameters: MixedInterface = {}) {
        this.add(parameters);
    }

    clear() {
        this.parameters = {};
    }

    add(parameters: MixedInterface) {
        Object.keys(parameters).forEach(entry => {
            this.set(entry, parameters[entry])
        });
    }

    all(): MixedInterface {
        return this.parameters;
    }

    escapeValue(mixed: MixedInterface) {
    }

    get(name: string): any {
        if (typeof this.parameters[name] === 'undefined') {
            if(name.length > 0) {
                throw new ParameterNotFoundException(name);
            }
        }

        const alternatives = [];
        // todo...

    }

    has(name: string): boolean {
        return false;
    }

    remove(name: string) {
    }

    resolve() {
    }

    resolveValue($value: MixedInterface) {
    }

    set(name: string, valu: any) {
    }

    unescapeValue(mixed: MixedInterface): MixedInterface {
        return undefined;
    }
}