import Collection from "../models/collection.model";
import Feature from "./feature.model";

class FeatureCollection extends Collection {
    add(key: string, item: Feature) {
        super.add(key, item);
    }
}

export default FeatureCollection;
