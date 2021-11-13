import ContainerInterface from "../interfaces/container.interface";
import CircularReferenceException from "../exception/circular-reference.exception";
import InvalidIdException from "../exception/invalid-id.exception";

export function resolveAlias(id: string, container: ContainerInterface): string {
    const alias = container.getAlias(id);

    // if (alias.isDeprecated()) {
    //
    // }

    const seen = {};
    let currentIdCheck = id;
    do {
        if (typeof seen[currentIdCheck] !== 'undefined') {
            throw new CircularReferenceException(currentIdCheck, [...Object.keys(seen), currentIdCheck]);
        }

        seen[id] = true;
        currentIdCheck = container.getAlias(currentIdCheck).toString();
    } while (container.hasAlias(currentIdCheck));

    return currentIdCheck;
};

export function checkDeprecation(id: string, container: ContainerInterface) {
    // todo
}

/**
 * @throws InvalidIdException
 * @param id
 */
export function checkValidId(id: string) {
    if (
        id.trim().length === 0 ||
        id.match(/\\$/) !== null ||
        id.length !== (id.match(/[^\0\r\n']/g))?.length
    ) {
        throw new InvalidIdException(id);
    }
}