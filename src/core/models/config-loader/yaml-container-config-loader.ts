import YamlConfigLoader from "./yaml-config-loader";
import ObjectResolver from "./yaml-value-resolver-handlers/object.resolver";
import ArrayResolver from "./yaml-value-resolver-handlers/array.resolver";
import ReferenceResolver from "./yaml-value-resolver-handlers/reference.resolver";
import DefaultResolver from "./yaml-value-resolver-handlers/default.resolver";

export default class YamlContainerConfigLoader extends YamlConfigLoader {
    public initializeHandler() {
        this.addHandler(new ArrayResolver(this.valueResolver, 'array-object-resolver'), 'array-object-resolver');
        this.addHandler(new ObjectResolver(this.valueResolver, 'standard-object-resolver'), 'standard-object-resolver');
        this.addHandler(new ReferenceResolver(this.valueResolver, 'reference-resolver'), 'reference-resolver');
        super.initializeHandler();
    }
}
