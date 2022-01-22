class Expression {
    private rawString: string = '';

    constructor(rawString: string) {
        this.rawString = rawString;
    }

    toString() {
        return this.rawString;
    }
}
