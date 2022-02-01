/**
 * ParameterBagInterface is the interface implemented by objects that manage service container parameters.
 */
import MixedInterface from "../../utils/mixed.interface";

export default interface ParameterBagInterface {
    /**
     * Clears all parameters.
     *
     * @throws LogicException if the ParameterBagInterface can not be cleared
     */
    clear();

    /**
     * Adds parameters to the service container parameters.
     *
     * @throws LogicException if the parameter can not be added
     */
    add(parameters: MixedInterface);

    /**
     * Gets the service container parameters.
     *
     * @return {MixedInterface} An array of parameters
     */
    all(): MixedInterface;

    /**
     * Gets a service container parameter.
     *
     * @return any
     * @throws ParameterNotFoundException if the parameter is not defined
     */
    get(name: string): any;

    /**
     * Removes a parameter.
     */
    remove(name: string);

    /**
     * Sets a service container parameter.
     *
     * @throws LogicException if the parameter can not be set
     */
    set(name: string, value: any): ParameterBagInterface;

    /**
     * Returns true if a parameter name is defined.
     *
     * @return boolean true if the parameter name is defined, false otherwise
     */
    has(name: string): boolean;

    /**
     * Replaces parameter placeholders (%name%) by their values for all parameters.
     */
    resolve();

    /**
     * Replaces parameter placeholders (%name%) by their values.
     *
     * @throws ParameterNotFoundException if a placeholder references a parameter that does not exist
     */
    resolveValue($value: any, resolving?: MixedInterface);

    /**
     * Escape parameter placeholders %.
     */
    escapeValue(mixed: any);

    /**
     * Unescape parameter placeholders %.
     *
     * @return any mixed
     */
    unescapeValue(mixed: any): any;
    addExclusionRule(rule: (value: MixedInterface) => boolean): this;

    isResolved(): boolean;

}
