import {PublisherInterface, Subscriber} from "@qphi/publisher-subscriber";
import { INVALID_REFERENCE_ON_GET } from "../container-notification";
import { EXCEPTION_ON_INVALID_REFERENCE } from "../container-builder.invalid-behaviors";
import ResourceNotFoundException from "../../exception/resource-not-found.exception";
import ContainerInterface from "../../interfaces/container.interface";
import DefaultContainerInterface from "../../interfaces/default-container.interface";
import {searchAlternativesString} from "../../helpers/string-alternatives.helper";


export default class ExceptionOnInvalidReferenceFeature extends Subscriber {
    constructor(container: DefaultContainerInterface) {
        super('exception-on-invalid-reference-feature');

        this.subscribe(container, INVALID_REFERENCE_ON_GET, ({ invalidBehavior, id }) => {
            if (invalidBehavior === EXCEPTION_ON_INVALID_REFERENCE) {
                //@todo split in composable voter system
                // InvalidServiceName
                if (id.length === 0) {
                    throw new ResourceNotFoundException(id);
                }

                // @todo Deal with synthetics: container should not know if a service is synthetic or not
                // add voter from container-builder as a  plugin ?
                // if (container.getDefinition(id).isSynthetic()) {
                //
                // }

                //@todo add this from container-builder features
            //     if (isset($this->getRemovedIds()[$id])) {
                //                 throw new ServiceNotFoundException($id, null, null, [], sprintf('The "%s" service or alias has been removed or inlined when the container was compiled. You should either make it public, or stop using the container directly and use dependency injection instead.', $id));
                //             }

                const alternatives = searchAlternativesString(id, container.getResourceIds());
                throw new ResourceNotFoundException(id, null, null, alternatives);
            }
        });
    }
}
