import InvalidArgumentException from "./invalid-argument.exception";
import NotFoundExceptionInterface from "../../../psr/container/not-found-exception.interface";

export default class ParameterNotFoundException extends InvalidArgumentException implements NotFoundExceptionInterface {
    private key: string;
    private sourceId?: string;
    private sourceKey?: string;
    private alternatives: string[];
    private nonNestedAlternative?: string;

    // todo fix
    /* eslint-disable  @typescript-eslint/no-unused-vars */
    constructor(
        key: string,
        sourceId: string | undefined = undefined,
        sourceKey: string | undefined = undefined,
        previous = null,
        alternatives: string[] = [],
        message: string = '',
        nonNestedAlternative: string | undefined = undefined
    ) {
        super('parameter not found');
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;

        this.key = key;
        this.sourceId = sourceId;
        this.sourceKey = sourceKey;
        this.alternatives = alternatives;
        this.nonNestedAlternative = nonNestedAlternative;

        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
        this.updateRepr();
    }

    public updateRepr() {
        if (typeof this.sourceId !== 'undefined') {
            this.message = `The service "${this.sourceId}" has a dependency on a non-existent parameter "${this.key}".`;
        } else if (typeof this.sourceKey !== 'undefined') {
            this.message = `The parameter "${this.sourceKey}" has a dependency on a non-existent parameter "${this.key}".`
        } else {
            this.message = `You have requested a non-existent parameter "${this.key}".`;
        }

        if (this.alternatives.length > 0) {
            if (this.alternatives.length === 1) {
                this.message += ' Did you mean this: "';
            } else {
                this.message += ' Did you mean one of these: "';
            }

            this.message += this.alternatives.join('", "') + '"?';
        } else if (this.nonNestedAlternative) {
            this.message += ` You cannot access nested array items, do you want to inject "${this.nonNestedAlternative}" instead?`;
        }
    }

    public getKey() {
        return this.key;
    }

    public getSourceId() {
        return this.sourceId;
    }

    public getSourceKey() {
        return this.sourceKey;
    }

    public setSourceId(sourceId: string) {
        this.sourceId = sourceId;
        this.updateRepr();
    }

    public setSourceKey(sourceKey: string) {
        this.sourceKey = sourceKey;
        this.updateRepr();
    }
}
