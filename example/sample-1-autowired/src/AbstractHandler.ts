import AAbstractHandler from "./AAbstractHandler";

export default abstract class AbstractHandler extends AAbstractHandler {
    public hello(): string {
        return 'hello from AbstractHandler'
    }
}
