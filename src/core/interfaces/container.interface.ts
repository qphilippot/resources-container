import type Alias from "../models/alias.model";
import Mixed from "../../utils/mixed.interface";

export default interface ContainerInterface {
    hasParameter(name: string): boolean;
    getParameter(name: string): any;
    setParameter(name: string, value: any): void;

    /**
     * Gets a resource.
     *
     * @return object|null The associated service
     *
     * @throws ServiceCircularReferenceException When a circular reference is detected
     * @throws ServiceNotFoundException          When the service is not defined
     * @throws \Exception                        if an exception has been thrown when the service has been resolved
     *
     * @see Reference
     */
    get(id: string, invalidBehavior?: number): any;

    getResources(): Mixed;

    getAliases(): Record<string, Alias>;
    hasAlias(alias: string): boolean;
    getAlias(alias: string): Alias;
    removeAlias(alias: string):void;
    clearAliases(): void;

    /**
     * @deprecated
     * @alias setResource
     **/
    set(id: string, resource: any): void;

    /** @alias set **/
    setResource(id: string, resource: any): void;

    /**
     * Sets an alias for an existing service.
     *
     * @param {string} alias The alias to create
     * @param {string} id The service to alias
     *
     * @returns {Alias}
     *
     * @throws {InvalidArgumentException} if the id is not a string or an Alias
     * @throws {InvalidArgumentException} if the alias is for itself
     */
    setAlias(alias: string, id: Alias): Alias;
    setAliasFromString(alias: string, id: string): Alias;

    getResourceIds(): string[];

    // setDataSlot(name: string, value: any): void;
    // getDataSlot(name: string): any;
}
