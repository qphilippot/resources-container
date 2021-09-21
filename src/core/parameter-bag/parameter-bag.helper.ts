import MixedInterface from "../../utils/mixed.interface";
import ParameterCircularReferenceException from "../exception/parameter-circular-reference.exception";

export function checkKey(key: string, resolving: MixedInterface = {}): string {
    if (typeof resolving[key] !== 'undefined') {
        throw new ParameterCircularReferenceException(Object.keys(resolving));
    }

    resolving[key] = true;
    return key;
}