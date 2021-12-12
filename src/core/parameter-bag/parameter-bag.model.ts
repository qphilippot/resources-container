import MixedInterface from "../../utils/mixed.interface";
import ParameterBagInterface from "./parameter-bag.interface";
import ParameterNotFoundException from "../exception/parameter-not-found.exception";
import * as levenshtein from 'fast-levenshtein';
import RuntimeException from "../exception/runtime.exception";
import { checkKey } from "./parameter-bag.helper";

// todo add setNestedDelimiter and setParameterDelimiter in order to allow customisation like: my.#param# or even my\#param#
export default class ParameterBag implements ParameterBagInterface {
    protected parameters: MixedInterface = {};
    protected exclusionRules: ((values: MixedInterface) => boolean)[] = [];
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

    public addExclusionRule(rule: ((values: MixedInterface) => boolean)): void {
        this.exclusionRules.push(rule);
    }

    all(): MixedInterface {
        return this.parameters;
    }

    get(name: string, separator:string = '.'): any {
        if (typeof this.parameters[name] === 'undefined') {
            if (name.length === 0) {
                throw new ParameterNotFoundException(name);
            }

            const alternatives: string[] = [];
            Object.keys(this.parameters).forEach(key => {
                const distance = levenshtein.get(name, key);
                if (distance <= name.length / 3 || key.includes(name)) {
                    alternatives.push(key);
                }
            });

            let nonNestedAlternative: string | undefined;
            if (alternatives.length === 0 && name.includes(separator)) {
                const tokens: string[] = name.split(separator);
                const nbTokens = tokens.length;
                let i = 0, alternativeFound = false;

                while (i < nbTokens && !alternativeFound) {
                    const key: string = tokens.shift() ?? '';

                    if (this.has(key)) {
                        if (typeof this.get(key) !== 'undefined') {
                            nonNestedAlternative = key;
                        }

                        alternativeFound = true;
                    }

                    ++i;
                }
            }

            throw new ParameterNotFoundException(name, undefined, undefined, null, alternatives, '', nonNestedAlternative);
        }

        return this.parameters[name];
    }

    has(name: string): boolean {
        return typeof this.parameters[name] !== 'undefined';
    }

    remove(name: string) {
        delete this.parameters[name];
    }

    private isExcluded(value: MixedInterface) {
        return this.exclusionRules.findIndex(rule => rule(value)) >= 0;
    }

    resolve() {
        if (this.resolved) {
            return;
        }

        const parameters: MixedInterface = {};
        Object.keys(this.parameters).forEach(key => {
            const value = this.parameters[key];

            try {
                const resolvedValue: any = this.resolveValue(value);
                parameters[key] = this.unescapeValue(resolvedValue);
            } catch (error) {
                if (error instanceof ParameterNotFoundException) {
                    error.setSourceKey(key);
                    throw error;
                }
            }
        });

        this.parameters = parameters;
        this.resolved = true;
    }


    /**
     * Replaces parameter placeholders (%name%) by their values.
     *
     * @param {any} value
     * @param {MixedInterface} resolving An array of keys that are being resolved (used internally to detect circular references)
     *
     * @return {any} The resolved value
     *
     * @throws ParameterNotFoundException          if a placeholder references a parameter that does not exist
     * @throws ParameterCircularReferenceException if a circular reference if detected
     * @throws RuntimeException                    when a given parameter has a type problem
     */
    resolveValue(value: any, resolving: MixedInterface = {}): any {
        if (this.isExcluded(value)) {
            return value;
        }

        if (typeof value === 'object' && value !== null) {
            const args = {};

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    args[index] = this.resolveValue(item, {...resolving});
                });
            } else {
                Object.keys(value).forEach(k => {
                    const key = this.resolveValue(k, {...resolving});
                    args[key] = this.resolveValue(value[k], {...resolving});
                });
            }

            return args;
        }

        if (typeof value !== 'string' || value.length < 2) {
            return value;
        }

        return this.resolveString(value, resolving);
    }

    /**
     * Resolves parameters inside a string.
     *
     * @param {string} value
     * @param {MixedInterface} resolving An array of keys that are being resolved (used internally to detect circular references)
     *
     * @return {any} The resolved string
     *
     * @throws ParameterNotFoundException          if a placeholder references a parameter that does not exist
     * @throws ParameterCircularReferenceException if a circular reference if detected
     * @throws RuntimeException                    when a given parameter has a type problem
     */
    resolveString(value: string, resolving: MixedInterface = {}) {
        const match = value.match(/^%([^%\s]+)%$/);
        if (match !== null) {
            const key = checkKey(match[1], resolving);
            return this.resolved ? this.get(key) : this.resolveValue(this.get(key), { ...resolving });
        }

        return value.replace(/%%|%([^%\s]+)%/g, (substring, token,) => {
            if (typeof token === 'undefined') {
                return substring;
            }

            // as we are on for-loop, we don't want to add "key" to resolving map yet
            const key = checkKey(token, { ...resolving });

            let resolved = this.get(key);

            if (typeof resolved !== 'string' && !(typeof resolved === 'number' && !Number.isNaN(resolved))) {
                throw new RuntimeException(
                    `A string value must be composed of strings and/or numbers, but found parameter "${key}" of type "${typeof resolved}" inside string value "${value}".`
                );
            }

            resolved = resolved.toString();

            return (
                this.isResolved()
                    ? resolved
                    // add key as a resolved entry for sub-levels of resolution in order to allow circular references detection
                    : this.resolveString(resolved, { ...resolving, [key]: true })
            );
        });
    }


    set(name: string, value: any): ParameterBagInterface {
        this.parameters[name] = value;
        return this;
    }

    escapeValue(mixed: any) {
        if (typeof mixed === 'string') {
            return mixed.replace(/%/g, '%%');
        }

        if (typeof mixed === 'object' && mixed !== null) {
            const escaped = {};
            Object.keys(mixed).forEach(property => {
                escaped[property] = this.escapeValue(mixed[property]);
            });

            return escaped;
        }

        return mixed;
    }

    unescapeValue(mixed: any): any {
        if (this.isExcluded(mixed)) {
            return mixed;
        }

        if (typeof mixed === 'string') {
            return mixed.replace(/%%/g, '%');
        }

        if (typeof mixed === 'object') {
            const escaped = {};
            Object.keys(mixed).forEach(property => {
                escaped[property] = this.unescapeValue(mixed[property]);
            });

            return escaped;
        }

        return mixed;
    }

    public isResolved(): boolean {
        return this.resolved;
    }

}
