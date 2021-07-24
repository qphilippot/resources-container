import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import HandlerInterface from "../../interfaces/handler.interface";

export default interface ConfigLoaderHandlerInterface extends HandlerInterface  {
    load(path: string, container: ContainerBuilderInterface);
}