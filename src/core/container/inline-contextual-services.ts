export default class InlineContextualServices {
    private inlineServices: Record<string, any> = {};
    private fromConstructor: boolean = false;

    has(id: string) {
        return typeof this.inlineServices[id] !== 'undefined';
    }

    get(id: string): any {
        return this.inlineServices[id];
    }

    set(id: string, service: any) {
        this.inlineServices[id] = service;
    }
    
    isFromConstructor(): boolean {
        return this.fromConstructor;
    }

    setFromConstructor(value: boolean = true): void {
        this.fromConstructor = value;
    }
}