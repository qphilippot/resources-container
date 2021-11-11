import CircularReferenceException from "./exception/circular-reference.exception";

export default class CircularReferencesDetectorService {
    private seen: Record<string, boolean> = {};

    record(resourceId: string) {
        if (this.seen[resourceId] === true) {
            throw new CircularReferenceException(resourceId, Object.keys(this.seen));
        }

        this.seen[resourceId] = true;
    }
}