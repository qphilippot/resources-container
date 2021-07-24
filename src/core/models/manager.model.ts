import HandlerInterface from "../interfaces/handler.interface";
import ManagerInterface from "../interfaces/manager.interface";
import FileLoaderNotFoundException from "../exception/file-loader-not-found.exception";
import PublisherSubscriber from "../../publisher-subscriber/model/publisher-subscriber.model";

export default abstract class Manager extends PublisherSubscriber implements ManagerInterface
{
    protected handlers: Record<string, HandlerInterface>;

    public addHandler(handler: HandlerInterface, name: string) {
        this.handlers[name] = handler;
    }

    removeHandler(name: string) {
        // todo: auto-unsubscribe to all subscriptions
        delete this.handlers[name];
    }

    /**
     *
     * @param {Object} obj
     * @param {string} obj.path
     */
    process(data) {
        console.log('manager process');
        const path = data.path;
        const handler = Object.values(this.handlers).find(handler => handler.match(path));

        if (handler) {
            return this.delegate(handler, data);
        }

        else {
            throw new FileLoaderNotFoundException(path);
        }
    }

    protected delegate(handler: HandlerInterface, { path }) {
        return handler.process(path);
    }
}