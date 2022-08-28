import AbstractHandler from "./AbstractHandler";

export default class HandlerB extends AbstractHandler{
    public hello(): string {
        return 'hello from HandlerB'
    }

    public someMethod(requiredParameter, optionalParameter?: string) {
        // do nothing
    }

    public methodUsingDefaultValue(parameterWithDefaultValue: string = 'youpi') {
        // do nothing
    }
}
