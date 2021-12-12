import HandlerInterface from "../interfaces/handler.interface";
import ManagerInterface from "../interfaces/manager.interface";
import {PublisherSubscriber} from '@qphi/publisher-subscriber';
import HandlerNotFoundException from "../exception/handler-not-found.exception";

export default class Manager extends PublisherSubscriber implements ManagerInterface
{
    protected handlers: Record<string, HandlerInterface> = {};

    public addHandler(handler: HandlerInterface, name: string): void {
        this.handlers[name] = handler;
    }

    public removeHandler(name: string): void {
        // todo: auto-unsubscribe to all subscriptions
        delete this.handlers[name];
    }

    /**
     *
     * @param {Object} obj
     * @param {string} obj.path
     */
    public process(data: any) {
        const path = data.path;
        const dataForHandlers = this.retrieveDataForHandlers(data);
        const handler = Object.values(this.handlers).find(handler => handler.match(dataForHandlers));

        if (handler) {
            return this.delegate(handler, data);
        }

        else {
            throw new HandlerNotFoundException(path);
        }
    }

    public retrieveDataForHandlers(data) {
        return data;
    }

    protected delegate(handler: HandlerInterface, data) {
        return handler.process(data);
    }
}
