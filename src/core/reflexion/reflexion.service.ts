import {CodeElementMetadata} from "../../generate-classes-metadata";
import {IS_CLASS, IS_INTERFACE} from "./reflexion.config";
import {GET_EMPTY_INHERITANCE_TREE, InheritanceTree} from "../../reflection/reflection.helper";

// https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
type Class = { new(...args: any[]): any; };


export default class ReflexionService {
    private meta: Record<string, CodeElementMetadata> = {};
    private inheritanceTree: InheritanceTree = GET_EMPTY_INHERITANCE_TREE();
    private dictionary: Map<string, Class> = new Map<string, Class>();

    public recordClass(name: string, theClass: Class, meta?: CodeElementMetadata): this {
        this.dictionary.set(name, theClass);
        if (meta) {
            this.setCodeElementMeta(name, meta);
        }
        return this;
    }

    public setCodeElementMeta(name: string, meta: CodeElementMetadata): this {
        this.meta[name] = meta;
        return this;
    }

    public setInheritanceTree(tree: InheritanceTree): void {
        this.inheritanceTree = tree;
    }

    public getImplementationsOf(interfaceName: string): string[] {
        if (this.meta[interfaceName]?.kind !== IS_INTERFACE) {
            // todo dedicated error class + check if its class + check typo
            throw `Interface "${interfaceName}" was not found.`;
        }



        return Object.keys(this.inheritanceTree.implementsInterface).filter(entry => {
            return this.isClass(entry) && this.inheritanceTree.implementsInterface[entry].includes(interfaceName);
        });
    }

    public findClass(className: string): Class | undefined {
        switch (className) {
            case 'Object':
                return Object;
            default:
                const candidate = this.dictionary.get(className);
                return this.meta[className]?.kind === 'class' ? candidate : undefined;
        }
    }

    public isInterface(name): boolean {
        return this.meta[name]?.kind === IS_INTERFACE;
    }

    public isClass(name): boolean {
        return this.meta[name]?.kind === IS_CLASS;
    }

    public isKindOf(name: string, kind: string): boolean {
        return this.meta[name]?.kind === kind;
    }


    /**
     * Inspired from: https://davidwalsh.name/javascript-arguments
     * @param func
     */
    public getFunctionArgumentsName(func: Function): Array<string> {
        return this.parseFunctionDefinition(func.toString());
    }

    public parseFunctionDefinition(functionDefinition: string): Array<string> {
        const tokens = functionDefinition.match(/function\s.*?\(([^)]*)\)/) || [];

        if (tokens.length < 1) {
            return tokens;
        }

        const name = tokens[0];
        const args = tokens[1];

        // Split the arguments string into an array comma delimited.
        return [name].concat(args.split(',').map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        }));
    }
}
