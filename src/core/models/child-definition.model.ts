import Definition from "./definition.model";
import MixedInterface from "../../utils/mixed.interface";
import OutOfBoundsException from "../exception/out-of-bounds.exception";
import InvalidArgumentException from "../exception/invalid-argument.exception";

const CHILD_PARAMETER_PREFIX = 'index_';
export default class ChildDefinition extends Definition {

    private parentDefinitionId: string;

    constructor(parentDefinitionId: string) {
        super();
        this.parentDefinitionId = parentDefinitionId;
    }

    public getParentDefinitionId(): string {
        return this.parentDefinitionId;
    }

    public setParentDefinitionId(parentDefinitionId: string): this {
        this.parentDefinitionId = parentDefinitionId;
        return this;
    }

    public getId(): string {
        return this.parentDefinitionId;
    }

    /**
     * Gets an argument to pass to the service constructor/factory method.
     *
     * If replaceArgument() has been used to replace an argument, this method
     * will return the replacement value.
     *
     * @throws OutOfBoundsException When the argument does not exist
     */
    public getArgument(key: string): MixedInterface {
        const decoratedArgument = this.arguments[`${CHILD_PARAMETER_PREFIX}${key}`];
        return (typeof decoratedArgument !== 'undefined') ? decoratedArgument : super.getArgument(key);
    }

    /**
     * You should always use this method when overwriting existing arguments
     * of the parent definition.
     *
     * If you directly call setArguments() keep in mind that you must follow
     * certain conventions when you want to overwrite the arguments of the
     * parent definition, otherwise your arguments will only be appended.
     *
     * @return this
     *
     * @throws InvalidArgumentException when key isn't an integer
     */
    public replaceArgument(key: string, value: any): this {
        const keyAsNumber = parseInt(key, 10);
        if (!isNaN(keyAsNumber)) {
           this.arguments[`${CHILD_PARAMETER_PREFIX}${key}`] = value;
        } else if (key.charAt(0) === '$') {
            this.arguments[key] = value;
        } else {
          throw new InvalidArgumentException(
              'The argument must be an existing index or the name of a constructor\'s parameter.'
          );
        }

        return this;
    }
}
