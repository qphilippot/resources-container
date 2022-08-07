import HandlerA from "./HandlerA";
import HandlerB from "./HandlerB";

export default class MainClass {
    private handlerA: HandlerA;
    private handlerB: HandlerB;

    constructor(handlerA: HandlerA, handlerB: HandlerB) {
        this.handlerA = handlerA;
        this.handlerB = handlerB;
    }

    public hello(): string {
        return 'hello i am MainClass & ' + this.handlerA.hello() + ' & ' + this.handlerB.hello();
    }
}
