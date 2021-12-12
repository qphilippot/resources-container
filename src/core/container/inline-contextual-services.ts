export default class InlineContextualServices {
    private inlineServices: Record<string, any> = {};
    private fromConstructor: boolean = false;

    public has(id: string) {
        return typeof this.inlineServices[id] !== 'undefined';
    }

    public get(id: string): any {
        return this.inlineServices[id];
    }

    public set(id: string, service: any) {
        this.inlineServices[id] = service;
    }

    public isFromConstructor(): boolean {
        return this.fromConstructor;
    }

    public setFromConstructor(value: boolean = true): void {
        this.fromConstructor = value;
    }
}
