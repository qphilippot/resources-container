import NotFoundExceptionInterface from "../../../psr/container/not-found-exception.interface";

export default class ResourceNotFoundException extends Error  implements NotFoundExceptionInterface {
    constructor(id, sourceId = null, previous = null, alternatives = [], msg: string = '') {
        if (msg !== '') {
            // no-op
        }
        else if (sourceId === null) {
            msg = `You have requested a non-existent service "${id}".`;
        }
        else {
            msg = `The service "${sourceId}" has a dependency on a non-existent service "${id}".`;
        }

        if (alternatives.length > 0) {
            if (alternatives.length === 1) {
                msg += ' Did you mean this: "';
            }
            else {
                msg += ' Did you mean one of these: "';
            }

            msg += alternatives.join('", "') + '"?';
        }

        super(msg);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}