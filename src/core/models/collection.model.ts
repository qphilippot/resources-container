import ItemNotFoundException from "../exception/item-not-found.exception";

class Collection<T> {
    private data: Record<string, T> = {};

    public has(key: string): boolean {
        return typeof this.data[key] !== 'undefined';
    }

    public add(key: string, item: T): void {
        this.data[key] = item;
    }

    public get(key: string): T {
        if (!this.has(key)) {
            throw new ItemNotFoundException(
                `Cannot find item "${key}" in collection.`
            );
        }
        return this.data[key];
    }

    public keys(): string[] {
        return Object.keys(this.data);
    }
}

export default Collection;
