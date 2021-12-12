import {PublisherInterface, Subscriber} from "@qphi/publisher-subscriber";
import { INVALID_REFERENCE_ON_GET } from "../container-notification";
import { EXCEPTION_ON_INVALID_REFERENCE } from "../container-builder.invalid-behaviors";
import ResourceNotFoundException from "../../exception/resource-not-found.exception";
import ContainerInterface from "../../interfaces/container.interface";

export default class AllowAliasDefinitionFeature extends Subscriber {
    constructor(container: ContainerInterface) {
        super('allow-alias-feature');


    }
}
