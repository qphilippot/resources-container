import PublisherInterface from "../../publisher-subscriber/interfaces/publisher.interface";

export default interface HandlerInterface extends PublisherInterface {
    match(key: string): boolean;
    process(data: any);
}