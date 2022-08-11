import HandlerAInterface from "./HandlerA.interface";

export default class HandlerA implements HandlerAInterface {
    public hello(): string {
        return 'hello from HandlerA'
    }
}

export class toto {};
