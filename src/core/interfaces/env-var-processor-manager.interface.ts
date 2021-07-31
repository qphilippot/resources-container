/**
 * The EnvVarProcessorInterface is implemented by objects that manage environment-like variables.*
 */
import ContainerInterface from "./container.interface";

export default interface EnvVarProcessorManagerInterface
{
    /**
     * Returns the value of the given variable as managed by the current instance.
     *
     * @param {string}   prefix The namespace of the variable
     * @param {string}   name   The name of the variable within the namespace
     * @param {Function} getEnv A closure that allows fetching more env vars
     *
     * @returns {mixed}
     *
     * @throws RuntimeException on error
     */
    getEnv(prefix: string, name: string, getEnv: Function);

    /**
     * @returns {string[]} The types managed by getEnv(), keyed by prefixes
     */
    getProvidedTypes(): Record<string, string>;

    getContainer(): ContainerInterface;
    getLoadedVar();
}
