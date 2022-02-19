import ParameterBag from "./parameter-bag.model";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import RuntimeException from "../exception/runtime.exception";
import * as md5 from 'md5'
import ParameterBagInterface from "./parameter-bag.interface";
export default class EnvPlaceholderBag extends ParameterBag {
    private envPlaceholderPrefix: string = '';
    private envPlaceholders: Map<string, any> = new Map<string, string[]>();
    private unusedEnvPlaceholders: Map<string, any> = new Map<string, string[]>();
    private providedTypes: Map<string, string[]> = new Map<string, string[]>();

    private static counter: number = 0;

    protected getEnvRegex(): RegExp {
        return /^env\((.+)\)$/;
    }

    protected getValidEnvParameterRegex(): RegExp {
        return /^[a-zA-Z0-9:_.-]+$/;
    }

    // todo comprendre ce que fait le get avec les envPlaceholders
    public get(name: string, separator: string = '.'): any {
        const matches = name.match(this.getEnvRegex());
        if (matches !== null) {
            // match[0] contains the full string
            const env = matches[1];

            // todo use voter system instead
            if (this.envPlaceholders.has(env)) {
                return this.envPlaceholders.get(env)[0];
            }

            if (this.unusedEnvPlaceholders.has(env)) {
                return this.unusedEnvPlaceholders.get(env)[0];
            }

            if (env.match(this.getValidEnvParameterRegex()) === null) {
                throw new InvalidArgumentException(
                    `Invalid ${name} name: only "word" characters are allowed.`
                );
            }

            if (this.has(name)) {
                const defaultValue = super.get(name);
                if (defaultValue !== null && typeof defaultValue !== 'string') {
                    throw new RuntimeException(
                        `The default value of an env() parameter must be a string or null, but "${defaultValue.constructor.name}" given to "${name}".`
                    );
                }
            }

            const uniqueName = md5(name + '_' + EnvPlaceholderBag.counter++);
            const placeholder = `${this.getEnvPlaceholderUniquePrefix()}_${env.replace(/[:.-]/g, '_')}_${uniqueName}`;
            this.envPlaceholders.set(env, [ placeholder ]);

            return placeholder;
        }

        return super.get(name);
    }


    /**
     * todo
     * Gets the common env placeholder prefix for env vars created by this bag.
     */
    public getEnvPlaceholderUniquePrefix(): string {
        if (this.envPlaceholderPrefix.length === 0) {
            this.envPlaceholderPrefix = 'env_' + md5(Object.keys(this.parameters)).substr(0,16);
        }

        return this.envPlaceholderPrefix;
    }


    /**
     * Returns the map of env vars used in the resolved parameter values to their placeholders.
     *
     * @return string[][] A map of env var names to their placeholders
     */
    public getEnvPlaceholders(): Map<string, string[]> {
        return this.envPlaceholders;
    }

    public getUnusedEnvPlaceholders(): Map<string, string[]> {
        return this.unusedEnvPlaceholders;
    }

    public clearUnusedEnvPlaceholders() {
        this.unusedEnvPlaceholders.clear();
    }

    merge(bag: ParameterBagInterface) {
        super.merge(bag);

        if (bag instanceof EnvPlaceholderBag) {
            this.mergeEnvPlaceholders(bag);
        }
    }

    /**
     * Merges the env placeholders of another EnvPlaceholderParameterBag.
     */
    public mergeEnvPlaceholders(bag: EnvPlaceholderBag) {
        this.mergeMap(this.envPlaceholders, bag.getEnvPlaceholders());
        this.mergeMap(this.unusedEnvPlaceholders, bag.getUnusedEnvPlaceholders());
    }

    private mergeMap(target: Map<string, string[]>, source: Map<string, string[]>): void {
        if (source.size > 0) {
            for (const iterator of source.keys()) {
                const entry = iterator.toString();
                const entries: Set<string> = new Set<string>(target.get(entry));
                const placeholders = source.get(entry) ?? [];
                placeholders.forEach(value => {
                    entries.add(value);
                });

                target.set(entry, Array.from(entries));
            }
        }
    }
    /**
     * Maps env prefixes to their corresponding types.
     */
    public setProvidedTypes(providedTypes: Map<string, string[]>) {
        this.providedTypes = providedTypes;
    }

    /**
     * Gets types corresponding to env() parameter prefixes.
     */
    public getProvidedTypes(): Map<string, string[]> {
        return this.providedTypes;
    }

    /**
     * {@inheritdoc}
     */
    public resolve() {
        if (this.resolved) {
            return;
        }

        super.resolve();
        this.checkResolvedValuesSanity();
    }

    protected checkResolvedValuesSanity(): void {
        for (const iterator of this.envPlaceholders.keys()) {
            const name = 'env(' + iterator.toString() + ')';
            const currentValue = this.parameters[name];

            if (this.has(name) && currentValue !== null && typeof currentValue !== 'string') {
                throw new RuntimeException(
                    `The default value of env parameter "${iterator.toString()}" must be a string or null, "${typeof currentValue}" given.`
                );
            }
        }
    }
}
