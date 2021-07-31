import FileLoader from "../../../../file-loader/file-loader.model";
import YamlLoader from "../../../../file-loader/yaml-loader";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import { dirname } from 'path';
import Publisher from "../../../publisher-subscriber/model/publisher.model";
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import ManagerInterface from "../../interfaces/manager.interface";
import Manager from "../manager.model";
import handlerInterface from "../../interfaces/handler.interface";
import YamlConfigLoader from "./yaml-config-loader";
import ObjectResolver from "./yaml-value-resolver-handlers/object.resolver";
import ArrayResolver from "./yaml-value-resolver-handlers/array.resolver";
import ReferenceResolver from "./yaml-value-resolver-handlers/reference.resolver";

export default class YamlContainerConfigLoader extends YamlConfigLoader {
    initializeHandler() {
        this.addHandler(new ObjectResolver(this.valueResolver, 'standard-object-resolver'), 'standard-object-resolver');
        this.addHandler(new ArrayResolver(this.valueResolver, 'array-object-resolver'), 'array-object-resolver');
        this.addHandler(new ReferenceResolver(this.valueResolver, 'reference-resolver'), 'reference-resolver');
        super.initializeHandler();
    }
}