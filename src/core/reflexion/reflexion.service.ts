import MixedInterface from "../../utils/mixed.interface";

// https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
type Class = { new(...args: any[]): any; };

/**
 * todo should detect class name duplication
 */
export default class ReflexionService {
    private data: MixedInterface = {};
    private dictionary: Map<string, Class> = new Map<string, Class>();

    recordClass(className: string, theClass: Class) {
        this.dictionary.set(className, theClass);
    }

    loadMeta(meta: MixedInterface): void {
        this.data = meta;
    }

    findClassByAlias(alias: string) {
        return this.findClass(this.data[alias]?.name);
    }

    findClass(className: string): Class | undefined {
        return this.dictionary.get(className);
    }

    /**
     * Inspired from: https://davidwalsh.name/javascript-arguments
     * @param func
     */
    getFunctionArgumentsName(func: Function): Array<string> {
        return this.parseFunctionDefinition(func.toString());
    }

    parseFunctionDefinition(functionDefinition: string): Array<string> {
        const tokens = functionDefinition.match(/function\s.*?\(([^)]*)\)/) || [];

        if (tokens.length < 1) {
            return tokens;
        }

        const name = tokens[0];
        const args = tokens[1];

        // Split the arguments string into an array comma delimited.
        return [ name ].concat(args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        }));
    }

    find(className: string): Class | undefined {
        return this.findClass(className) || this.findClassByAlias(className);
    }
}