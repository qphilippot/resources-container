import InvalidArgumentException from "./invalid-argument.exception";
import NotFoundExceptionInterface from "../../../psr/container/not-found-exception.interface";
import RuntimeException from "./runtime.exception";
import MixedInterface from "../../utils/mixed.interface";

/**
 *  This exception is thrown when a circular reference in a parameter is detected.
 */
export default class ParameterCircularReferenceException extends RuntimeException {
    private parameters: string[];

    constructor(
        parameters: string[]
    ) {
        const key = parameters[0];
        super(
            `Circular reference detected for parameter "${key}" ("${parameters.slice(0,parameters.length).join('" > "')}" > "${key}").`
        );

        this.parameters = parameters;

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }

    getParameters(): string[] {
        return this.parameters;
    }
}
