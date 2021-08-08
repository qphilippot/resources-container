import PSRContainerInterface from  '../../../psr/container/container.interface';
import Alias from "../models/alias.model";

export default interface ContainerInterface extends PSRContainerInterface {
    hasParameter(name: string): boolean;
    getParameter(name: string): any;
    setParameter(name: string, value: any): void;


    getAliases(): Record<string, Alias>;
    hasAlias(alias: string): boolean;
    getAlias(alias: string): Alias;

    /**
     * Sets an alias for an existing service.
     *
     * @param {string} alias The alias to create
     * @param {string} id The service to alias
     *
     * @returns {ContainerInterface} the container interface (for method chaining)
     *
     * @throws {InvalidArgumentException} if the id is not a string or an Alias
     * @throws {InvalidArgumentException} if the alias is for itself
     */

    setAlias(alias: string, id: Alias): ContainerInterface;
    setAliasFromString(alias: string, id: string): ContainerInterface;
};
