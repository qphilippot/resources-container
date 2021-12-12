import InvalidArgumentException from "../exception/invalid-argument.exception";

export default class Alias {
    private static readonly DEFAULT_DEPRECATION_TEMPLATE: string = 'The "%alias_id%" service alias is deprecated. You should stop using it, as it will be removed in the future.';

    private id: string;
    /**
     * Can alias be accessed directly from the container at runtime
     * @private
     */
    private _isPublic: boolean;
    private deprecation: Record<string, any> = {};

    constructor(id: string, isPublic: boolean = false) {
        this.id = id;
        this._isPublic = isPublic;
    }

    /**
     * Checks if this DI Alias should be public or not.
     *
     * @return bool
     */
    isPublic(): boolean {
        return this._isPublic;
    }

    setPublic(isPublic: boolean) {
        this._isPublic = isPublic;
    }

    /**
     * Whether this alias is deprecated, that means it should not be referenced
     * anymore.
     *
     * @param {string} packageName The name of the composer package that is triggering the deprecation
     * @param {string} version The version of the package that introduced the deprecation
     * @param {string} message The deprecation message to use
     *
     * @return this
     *
     * @throws InvalidArgumentException when the message template is invalid
     */
    setDeprecated(packageName:string, version: string, message: string) {
        if (message.length > 0) {
            if (message.match(/[\r\n]|\*/)) {
                throw new InvalidArgumentException('Invalid characters found in deprecation template.');
            }

            if (message.includes('%alias_id%')) {
                throw new InvalidArgumentException(
                    'The deprecation template must contain the "%alias_id%" placeholder.'
                );
            }
        }

        this.deprecation = {
            package: packageName,
            version,
            message: message.length > 0 ? message : Alias.DEFAULT_DEPRECATION_TEMPLATE
        };

        return this;
    }

    getDeprecations(id: string) {
        const deprecations = { ...this.deprecation };
        deprecations.message = deprecations.message.replace('/%alias_id%/g', id);
        return deprecations;
    }

    isDeprecated(): boolean {
        return Object.keys(this.deprecation).length > 0;
    }

    toString(): string {
        return this.id;
    }
}
