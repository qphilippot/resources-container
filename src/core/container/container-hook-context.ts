export default class ContainerHookContext {
    private invalidBehavior: number;
    private mutedExceptions: Set<string> = new Set();
    private _shouldReturn:boolean = false;
    private returnValue:any = undefined;

    constructor(invalidBehavior: number) {
        this.invalidBehavior = invalidBehavior
    }

    public isBehavior(behavior: number): boolean {
        return this.invalidBehavior === behavior;
    }

    public shouldThrows(exceptionName): boolean {
        return !this.mutedExceptions.has(exceptionName);
    }

    public muteException(exceptionName): void {
        this.mutedExceptions.add(exceptionName);
    }

    public setValueToReturn(value: any) {
        this._shouldReturn = true;
        this.returnValue = value;
    }

    public shouldReturn(): boolean {
        return this._shouldReturn;
    }

    public getReturnValue(): any {
        return this.returnValue;
    }
}
