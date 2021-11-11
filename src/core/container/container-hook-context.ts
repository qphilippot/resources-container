export default class ContainerHookContext {
    private invalidBehavior: number;
    private mutedExceptions: Set<string> = new Set();
    private _shouldReturn:boolean = false;
    private returnValue:any = undefined;

    constructor(invalidBehavior: number) {
        this.invalidBehavior = invalidBehavior
    }

    isBehavior(behavior: number): boolean {
        return this.invalidBehavior === behavior;
    }

    shouldThrows(exceptionName): boolean {
        return !this.mutedExceptions.has(exceptionName);
    }

    muteException(exceptionName): void {
        this.mutedExceptions.add(exceptionName);
    }

    setValueToReturn(value: any) {
        this._shouldReturn = true;
        this.returnValue = value;
    }

    shouldReturn(): boolean {
        return this._shouldReturn;
    }

    getReturnValue(): any {
        return this.returnValue;
    }



}