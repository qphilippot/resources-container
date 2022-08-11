import HandlerAInterface from "./HandlerA.interface";
import AAbstractHandler from "./AAbstractHandler";

export default abstract class AbstractHandler extends AAbstractHandler implements HandlerAInterface {
    public hello(): string {
        return 'hello from AbstractHandler'
    }
}
