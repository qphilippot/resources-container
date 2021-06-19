import RuntimeException from "./runtime.exception";

export default class CircularReferenceException extends RuntimeException {
    private resourceId: string;
    private path: string[];

    constructor(resourceId: string, path: string[]) {
        super(`Circular reference detected for resource "${resourceId}", path "${path.join('->')}"`);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.path = path;
        this.resourceId = resourceId;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }

    getResourceId(): string {
        return this.resourceId;
    }

    getPath(): string[] {
        return this.path;
    }
}
