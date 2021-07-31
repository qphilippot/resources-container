/**
 * Adapt the PSR-11 Container interface
 */

/**
 * Describes the interface of a container that exposes methods to read its entries.
 */

export default interface PSRContainerInterface {
    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param id {string} Identifier of the entry to look for.
     *
     * @throws {NotFoundExceptionInterface} No entry was found for **this** identifier.
     * @throws {ContainerExceptionInterface} Error while retrieving the entry.
     *
     * @returns {mixed} Entry.
     */
    get(id: string);

    /**
     * Returns true if the container can return an entry for the given identifier.
     * Returns false otherwise.
     *
     * `has(id)` returning true does not mean that `get(id)` will not throw an exception.
     * It does however mean that `get(id)` will not throw a `NotFoundExceptionInterface`.
     *
     * @param id {string} Identifier of the entry to look for.
     *
     * @returns {boolean}
     */
    has(id: string);
}
