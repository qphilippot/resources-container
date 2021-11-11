import CircularReferenceException from "./exception/circular-reference.exception";

export default class CircularReferencesDetectorService {
    private seen: Record<string, boolean> = {};

    check(resourceId: string) {
        if (this.seen[resourceId] === true) {
            throw new CircularReferenceException(resourceId, Object.keys(this.seen));
        }
    }

    record(resourceId: string) {
        this.seen[resourceId] = true;
    }

    clear(resourceId:string) {
        delete this.seen[resourceId];
    }

    process(resourceId) {
        this.check(resourceId);
        this.record(resourceId);
    }
}