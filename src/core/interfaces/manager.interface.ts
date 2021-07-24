import HandlerInterface from "./handler.interface";

export default interface ManagerInterface {
    addHandler(handler: HandlerInterface, name: string);
    removeHandler(name: string);
    process(data: any);
}