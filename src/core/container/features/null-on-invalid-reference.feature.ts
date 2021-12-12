import {PublisherInterface, Subscriber} from "@qphi/publisher-subscriber";
import {
    ERROR_ON_GET_DEFINITION_BEFORE_COMPILATION,
    INVALID_REFERENCE_ON_GET_DEFINITION
} from "../container-notification";
import {NULL_ON_INVALID_REFERENCE} from "../container-builder.invalid-behaviors";
import ContainerHookContext from "../container-hook-context";
import ResourceNotFoundException from "../../exception/resource-not-found.exception";

export default class NullOnInvalidReferenceFeature extends Subscriber {
    constructor(container: PublisherInterface) {
        super('null-on-invalid-reference-feature');

        this.subscribe(container, ERROR_ON_GET_DEFINITION_BEFORE_COMPILATION, (context: ContainerHookContext) => {
            if (context.isBehavior(NULL_ON_INVALID_REFERENCE)) {
                context.muteException((new ResourceNotFoundException('')).name);
                context.setValueToReturn(null);
            }
        });
    }
}
