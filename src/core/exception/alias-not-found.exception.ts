// todo extends dependency-injection-error ??
import InvalidArgumentException from "./invalid-argument.exception";

export default class AliasNotFoundException extends InvalidArgumentException {
    constructor(id: string) {
        super(`The resource alias "${id}" does not exist.`);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}