import ContainerInterface from "../interfaces/container.interface";
import CircularReferenceException from "../exception/circular-reference.exception";
import InvalidIdException from "../exception/invalid-id.exception";
import ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import MixedInterface from "../../utils/mixed.interface";
import Reference from "../models/reference.model";
import Definition from "../models/definition.model";

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
}

/* eslint-disable  @typescript-eslint/no-unused-vars */
export function checkDeprecation(id: string, container: ContainerInterface) {
    // todo

}

/* eslint-enable  @typescript-eslint/no-unused-vars */


export function isValidDefinitionId(id: string): boolean {
    return (
        id.trim().length > 0 &&
        id.match(/\\$/) === null &&
        id.length === (id.match(/[^\0\r\n']/g))?.length
    );
}

/**
 * @throws InvalidIdException
 * @param id
 */
export function checkValidId(id: string) {
    if (!isValidDefinitionId(id)) {
        throw new InvalidIdException(id);
    }
}

export function setupDefaultParameterBagExclusionRules(bag: ParameterBagInterface): ParameterBagInterface {
    return bag.addExclusionRule(
        (values: MixedInterface) => values instanceof Reference
    ).addExclusionRule(
        (values: MixedInterface) => values instanceof Definition
    );
}
