import ContainerInterface from "./interfaces/container.interface";
import CircularReferenceException from "./exception/circular-reference.exception";

export default {
    /**
     * @throws {CircularReferenceException}
     * @param {string} id
     * @param {ContainerInterface} container
     * @returns {string} the resolved definition id
     */
    resolveAlias(id: string, container: ContainerInterface): string {
        const seen = {};
        let currentIdCheck = id;
        do {
            if (typeof seen[currentIdCheck] !== 'undefined') {
                throw new CircularReferenceException(currentIdCheck, [ ...Object.keys(seen), currentIdCheck ]);
            }

            seen[id] = true;
            currentIdCheck = container.getAlias(currentIdCheck);
        } while (container.hasAlias(currentIdCheck));

        return currentIdCheck;
    }
};