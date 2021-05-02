import MixedInterface from "../mixed.interface";

class Collection {
    private data: MixedInterface = {};

    has(key: string): boolean {
        return typeof this.data[key] !== 'undefined';
    }

    add(key: string, item: any) {
        this.data[key] = item;
    }

    get(key: string): any {
        return this.data[key];
    }
}

export default Collection;