import HandlerB from "./HandlerB";
import HandlerAInterface from "./HandlerA.interface";


export default class MainClass {
    private handlerA: HandlerAInterface;
    private handlerB: HandlerB;
    private str: string;
    private nb: number;

    constructor(handlerA: HandlerAInterface, handlerB: HandlerB, str: string = "abc", nb: number = 42) {
        this.handlerA = handlerA;
        this.handlerB = handlerB;
        this.str = str;
        this.nb = nb;
    }

    public hello(): string {
        return 'hello i am MainClass & ' + this.handlerA.hello() + ' & ' + this.handlerB.hello() + ` ${this.str}#${this.nb}`;
    }
}
