import handlerInterface from "../../../../../../src/core/interfaces/handler.interface";
import ContainerBuilderInterface from "../../../../../../src/core/interfaces/container-builder.interface";

export default class Sapristi {
    constructor(id) {
    }

    initializeHandler() {
    }

    addHandler(handler: handlerInterface, name: string) {
    }

    removeHandler(name: string) {
    }

    load(path: string, container: ContainerBuilderInterface) {
    }

    parseResources(parameters, path, container: ContainerBuilderInterface) {
    }

    /**
     * @throws InvalidArgumentException
     */
    parseDefaults(parameters, path: string) {
    }

    parseDefinition(id: string, resource: object | string | null, path: string, defaults, shouldReturn = false) {
    }

    resolveInstanceOf(_instanceof, path, container: ContainerBuilderInterface) {
    }

    parseParameters(parameters, path, container: ContainerBuilderInterface) {
    }

    resolveValue(value) {
    }

    parseImport(content, path: string, container: ContainerBuilderInterface) {
    }

    match(key: string): boolean {
        return true
    }

    process({path, container}) {
    }
}