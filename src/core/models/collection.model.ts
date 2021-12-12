import ItemNotFoundException from "../exception/item-not-found.exception";

class Collection<T> {
    private data: Record<string, T> = {};

    has(key: string): boolean {
        return typeof this.data[key] !== 'undefined';
    }

    add(key: string, item: T) {
        this.data[key] = item;
    }

    get(key: string): T {
        if (!this.has(key)) {
            throw new ItemNotFoundException(
                `Cannot find item "${key}" in collection.`
            );
        }
        return this.data[key];
    }

    keys(): string[] {
        return Object.keys(this.data);
    }
}

export default Collection;
