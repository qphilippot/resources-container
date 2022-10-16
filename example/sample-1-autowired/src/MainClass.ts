import HandlerB from "./HandlerB";
import HandlerAInterface from "./HandlerA.interface";


export default class MainClass {
    private handlerA: HandlerAInterface;
    private handlerB: HandlerB;

    constructor(handlerA: HandlerAInterface, handlerB: HandlerB) {
        this.handlerA = handlerA;
        this.handlerB = handlerB;
    }

    public hello(): string {
        console.log(this.handlerA);
        return 'hello i am MainClass & ' + this.handlerA.hello() + ' & ' + this.handlerB.hello();
    }
}
