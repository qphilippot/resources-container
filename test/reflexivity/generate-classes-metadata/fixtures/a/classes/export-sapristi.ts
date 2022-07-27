import {AbstractABC} from "./abstract/some-abstract";

export class ExportSapristi {
    constructor(id) {
    }

    public initializeHandler() {
    }


    /**
     * @throws InvalidArgumentException
     */
    public parseDefaults(parameters, path: string) {
    }

    public parseDefinition(id: string, resource: object | string | null, path: string, defaults, shouldReturn = false) {
    }


    public resolveValue(value) {
    }


    public match(key: string): boolean {
        return true
    }

    public process(): void {
        // this is intentional
    }
}


export class ABC extends AbstractABC {
    public text = 'def';
}
