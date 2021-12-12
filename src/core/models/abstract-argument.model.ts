/**
 * Represents an abstract service argument, which have to be set by a compiler pass or a DI extension.
 */
abstract class AbstractArgument {
    private readonly text: string = '';
    private context: string = '';

    protected constructor(text: string = '') {
        this.text = text;
    }

    public setContext(context: string): void {
        this.context = `${context} is abstract ${this.text.length === 0 ? '' : ':'}`;
    }

    public getText(): string {
        return this.text;
    }

    public getTextWithContext(): string {
        return this.context + this.text + '.';
    }

    public hasContext(): boolean {
        return this.context.length > 0;
    }
}

export default AbstractArgument;
