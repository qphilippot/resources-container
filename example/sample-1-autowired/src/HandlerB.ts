import AbstractHandler from "./AbstractHandler";

export default class HandlerB extends AbstractHandler{
    public hello(): string {
        return 'hello from HandlerB'
    }
}
