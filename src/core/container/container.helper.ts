import ContainerInterface from "../interfaces/container.interface";
import CircularReferenceException from "../exception/circular-reference.exception";

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