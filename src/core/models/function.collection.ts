import Collection from "./collection.model";

class FunctionCollection extends Collection {
    add(key: string, item: Function) {
        super.add(key, item);
    }

    get(key: string): Function {
        return super.get(key);
    }
}

export default FunctionCollection;
