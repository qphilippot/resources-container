/**
 * EnvVarLoaderInterface objects return key/value pairs that are added to the list of available env vars.
 */
export default interface EnvVarLoaderInterface
{
    /**
     * @returns {string[]} Key/value pairs that can be accessed using the regular "%env()%" syntax
     */
    loadEnvVars(): string[];
}
