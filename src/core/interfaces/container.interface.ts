import PSRContainerInterface from  '../../../psr/container/container.interface';
import Alias from "../models/alias.model";

// todo remove it !
export default // @ts-ignore
interface ContainerInterface extends PSRContainerInterface {
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
    get(id: string, invalidBehavior: number): any;

    getAliases(): Record<string, Alias>;
    hasAlias(alias: string): boolean;
    getAlias(alias: string): Alias;
    removeAlias(alias: string):void;

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
     * @returns {ContainerInterface} the container interface (for method chaining)
     *
     * @throws {InvalidArgumentException} if the id is not a string or an Alias
     * @throws {InvalidArgumentException} if the alias is for itself
     */
    setAlias(alias: string, id: Alias): ContainerInterface;
    setAliasFromString(alias: string, id: string): ContainerInterface;

    getResourceIds(): string[];

    setDataSlot(name: string, value: any): void;
    getDataSlot(name: string): any;
};
