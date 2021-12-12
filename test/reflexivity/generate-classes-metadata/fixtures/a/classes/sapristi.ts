import handlerInterface from "../../../../../../src/core/interfaces/handler.interface";
import ContainerBuilderInterface from "../../../../../../src/core/interfaces/container-builder.interface";

export default class Sapristi {
    constructor(id) {
    }

    public initializeHandler() {
    }

    public addHandler(handler: handlerInterface, name: string) {
    }

    public removeHandler(name: string) {
    }

    public load(path: string, container: ContainerBuilderInterface) {
    }

    public parseResources(parameters, path, container: ContainerBuilderInterface) {
    }

    /**
     * @throws InvalidArgumentException
     */
    public parseDefaults(parameters, path: string) {
    }

    public parseDefinition(id: string, resource: object | string | null, path: string, defaults, shouldReturn = false) {
    }

    public resolveInstanceOf(_instanceof, path, container: ContainerBuilderInterface) {
    }

    public parseParameters(parameters, path, container: ContainerBuilderInterface) {
    }

    public resolveValue(value) {
    }

    public parseImport(content, path: string, container: ContainerBuilderInterface) {
    }

    public match(key: string): boolean {
        return true
    }

    public process(): void {
        // this is intentional
    }
}
