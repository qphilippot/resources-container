import PSRContainerInterface from  '../../../psr/container/container.interface';

export default interface ContainerInterface extends PSRContainerInterface {
    hasParameter(name: string): boolean;
    getParameter(name: string): any;
    setParameter(name: string, value: any): void;


    getAliases(): Record<string, string>;
    hasAlias(alias: string): boolean;
    getAlias(alias: string): string;

    /**
     * Sets an alias for an existing service.
     *
     * @param {string} alias The alias to create
     * @param {string} id The service to alias
     *
     * @return {ContainerInterface} the container interface (for method chaining)
     *
     * @throws {InvalidArgumentException} if the id is not a string or an Alias
     * @throws {InvalidArgumentException} if the alias is for itself
     */

    setAlias(alias: string, id: string): ContainerInterface;
};
