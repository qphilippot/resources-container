import {
    ClassMetadata,
    CodeElementMetadata,
    GET_EMPTY_CODE_ELEMENT_DATA,
    ParameterMetadata
} from "../../generate-classes-metadata";
import {IS_CLASS, IS_INTERFACE} from "./reflexion.config";
import {GET_EMPTY_INHERITANCE_TREE, InheritanceTree} from "../../reflection/reflection.helper";
import ReflectionMethod from "./reflection-method.model";
import {CONSTRUCTOR_METHOD_NAME, ReflexionMethodVisibility} from "./reflection-method.config";
import ReflectionParameter from "./reflection-parameter.model";

// https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
type Class = { new(...args: any[]): any; };


export default class ReflexionService {
    private meta: Record<string, CodeElementMetadata> = {};
    private inheritanceTree: InheritanceTree = GET_EMPTY_INHERITANCE_TREE();
    private dictionary: Map<string, Class> = new Map<string, Class>();
    private typeToNamespaceMapping: Map<Class, string> = new Map<Class, string>();

    public recordClass(name: string, theClass: Class, meta?: CodeElementMetadata): this {
        this.dictionary.set(name, theClass);
        this.typeToNamespaceMapping.set(theClass, name);
        if (meta) {
            this.setCodeElementMeta(name, meta);
        } else {
            this.setCodeElementMeta(name, this.buildDefaultCodeElementMeta(name, IS_CLASS));
        }

        return this;
    }

    private buildDefaultCodeElementMeta(name: string, kind: string): CodeElementMetadata {
        return {
            ...GET_EMPTY_CODE_ELEMENT_DATA(),
            ...{
                kind: IS_CLASS,
                name
            }
        };
    }

    public getReflectionMethod(resourceType: InstanceType<any>,  methodName: string): ReflectionMethod {
        const namespacedResourceName = this.getNamespacedResourceName(resourceType);
        if (namespacedResourceName === null) {
            // todo throw dedicated error
            throw `Cannot find method "${methodName}" of resource "${resourceType.constructor.name}". No namespace was bind to this resource.`;
        }

        const meta = this.meta[namespacedResourceName] as ClassMetadata;
        if (methodName === CONSTRUCTOR_METHOD_NAME) {
            return new ReflectionMethod({
                visibility: ReflexionMethodVisibility.PUBLIC, // todo support private constructor
                isStatic: false,
                isAbstract: false,
                isConstructor: true,
                parameters: meta.constructor.map((parameter: ParameterMetadata) => {
                    return new ReflectionParameter({...parameter})
                })
            });
        }


        const methodMeta = meta.methods[methodName];
        if (methodName === null) {
            // todo throw dedicated error
            throw `Cannot find method "${methodName}" of resource "${resourceType.constructor.name}". No such method found in class metadata.`;

        }
        return new ReflectionMethod({
            visibility: methodMeta.visibility,
            isStatic: methodMeta.static,
            isAbstract: methodMeta.abstract,
            isConstructor: false,
            parameters: methodMeta.parameters.map((parameter: ParameterMetadata) => {
                return new ReflectionParameter({...parameter})
            })
        });
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

    public isInterface(namespacedResourceName): boolean {
        return this.meta[namespacedResourceName]?.kind === IS_INTERFACE;
    }

    public isClass(namespacedResourceName): boolean {
        return this.meta[namespacedResourceName]?.kind === IS_CLASS;
    }

    public isKindOf(namespacedResourceName: string, kind: string): boolean {
        return this.meta[namespacedResourceName]?.kind === kind;
    }

    public getNamespacedResourceName(resourceType: Class): string | null {
        return this.typeToNamespaceMapping.get(resourceType) ??  null
    }

    public getConstructorOf(namespacedResourceName: string): CodeElementMetadata | undefined {
        return this.meta[namespacedResourceName];
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
