import ContainerInterface from "./container.interface";
import {PublisherInterface} from "@qphi/publisher-subscriber";

export default interface DefaultContainerInterface extends ContainerInterface, PublisherInterface {}
