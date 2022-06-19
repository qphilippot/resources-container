import {PublisherInterface} from "@qphi/publisher-subscriber";

export default interface HandlerInterface extends PublisherInterface {
    match(data: any): boolean;
    process(data: any);
}
