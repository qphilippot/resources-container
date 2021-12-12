import {PublisherInterface, Subscriber} from "@qphi/publisher-subscriber";
import { INVALID_REFERENCE_ON_GET } from "../container-notification";
import { EXCEPTION_ON_INVALID_REFERENCE } from "../container-builder.invalid-behaviors";
import ResourceNotFoundException from "../../exception/resource-not-found.exception";

export default class ExceptionOnInvalidReferenceFeature extends Subscriber {
    constructor(container: PublisherInterface) {
        super('exception-on-invalid-reference-feature');

        this.subscribe(container, INVALID_REFERENCE_ON_GET, ({ invalidBehavior, id }) => {
            if (invalidBehavior === EXCEPTION_ON_INVALID_REFERENCE) {
                if (id.length === 0) {
                    throw new ResourceNotFoundException(id);
                }
            }
        });
    }
}
