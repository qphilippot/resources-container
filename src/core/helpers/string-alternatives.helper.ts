import * as levenshtein from 'fast-levenshtein';

export const searchAlternativesString = (
    key: string,
    stringAvailables: string[],
    exclude?: (string)=> boolean
): string[] => {
    const alternatives: string[] = [];
    for (const candidate of stringAvailables) {
        if (candidate.length === 0 || (typeof exclude === 'function' && exclude(candidate))) {
            continue;
        }

        const distance = levenshtein.get(key, candidate);
        if (distance <= key.length / 3 || candidate.includes(key)) {
            alternatives.push(candidate);
        }
    }

    return alternatives;
}
