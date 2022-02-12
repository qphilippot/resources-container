import ParameterBag from "./parameter-bag.model";
import MixedInterface from "../../utils/mixed.interface";
import ParameterBagInterface from "./parameter-bag.interface";
import LogicException from "../exception/logic.exception";

export default class ReadOnlyParameterBag implements ParameterBagInterface {
    private encapsuledBag: ParameterBag;

    constructor(parameters: MixedInterface = {}) {
        this.encapsuledBag = new ParameterBag(parameters);
        this.encapsuledBag.setAsResolved();

    }

    all(): MixedInterface {
        return this.encapsuledBag.all();
    }

    get(name: string) {
        return this.encapsuledBag.get(name);
    }

    has(name: string): boolean {
        return this.encapsuledBag.has(name);
    }

    resolve() {
        return this.encapsuledBag.resolve();
    }

    resolveValue($value: any, resolving?: MixedInterface) {
        return this.encapsuledBag.resolveValue($value, resolving);
    }

    escapeValue(mixed: any) {
        return this.encapsuledBag.escapeValue(mixed);
    }

    unescapeValue(mixed: any) {
        return this.encapsuledBag.unescapeValue(mixed);
    }

    addExclusionRule(rule: (value: MixedInterface) => boolean): this {
        throw new LogicException('Impossible to call addExclusionRule() on  a read-only ParameterBag.');
    }

    isResolved(): boolean {
        return this.encapsuledBag.isResolved();
    }

    /**
     * {@inheritdoc}
     */
    public clear() {
        throw new LogicException('Impossible to call clear() on  a read-only ParameterBag.');
    }

    /**
     * {@inheritdoc}
     */
    public add(parameters: MixedInterface) {
        throw new LogicException('Impossible to call add() on  a read-only ParameterBag.');
    }

    /**
     * {@inheritdoc}
     */
    public set(name: string, valu: any): ParameterBagInterface {
        throw new LogicException('Impossible to call set() on  a read-only ParameterBag.');
    }

    /**
     * {@inheritdoc}
     */
    public remove(name: string) {
        throw new LogicException('Impossible to call remove() on  a read-only ParameterBag.');
    }
}
