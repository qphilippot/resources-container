import ContainerInterface from "./interfaces/container.interface";
import CircularReferenceException from "./exception/circular-reference.exception";

class ContainerHelper {
    /**
     * @throws {CircularReferenceException}
     * @param {string} id
     * @param {ContainerInterface} container
     * @return {string} the resolved definition id
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
}

export default ContainerHelper;
export const ContainerHelperSingleton = new ContainerHelper();
