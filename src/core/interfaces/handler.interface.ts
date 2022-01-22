import PublisherInterface from "../../publisher-subscriber/interface/publisher.interface";

export default interface HandlerInterface extends PublisherInterface {
    match(data: any): boolean;
    process(data: any);
}
