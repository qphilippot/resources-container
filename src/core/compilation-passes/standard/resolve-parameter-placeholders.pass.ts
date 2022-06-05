import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import AbstractRecursivePassModel from "./abstract-recursive-pass.model";
import ParameterBagInterface from "../../parameter-bag/parameter-bag.interface";
import ContainerBuilder from "../../container/container-builder.model";
import Alias from "../../models/alias.model";
import ParameterNotFoundException from "../../exception/parameter-not-found.exception";
import Definition from "../../models/definition.model";

/**
 * Resolves all parameter placeholders "%somevalue%" to their real values.
 */
export default class ResolveParameterPlaceHoldersPass extends AbstractRecursivePassModel implements CompilerPassInterface {
    private bag: ParameterBagInterface;
    private shouldResolveArray: boolean = true;
    private shouldThrowExceptionOnResolve: boolean = true;

    public enableArrayResolution(status: boolean): void {
        this.shouldResolveArray = status;
    }

    public enableThrowExceptionOnResolve(status: boolean): void {
        this.shouldThrowExceptionOnResolve = status;
    }

    /**
     * {@inheritdoc}
     *
     * @throws ParameterNotFoundException
     */
    public process(container: ContainerBuilder) {
        this.bag = container.getParameterBag();

        try {
            super.process(container);

            const aliases: Record<string, Alias> = {};
            Object.keys(container.getAliases()).forEach(name => {
                const alias = container.getAlias(name);
                this.currentId = name;
                aliases[this.bag.resolveValue(name)] = alias;
            });

            container.clearAliases();
            Object.keys(aliases).forEach(name => {
                const alias = aliases[name];
                container.setAlias(name, alias);
            });

        } catch (err) {
            if (err instanceof ParameterNotFoundException) {
                err.setSourceId(this.currentId);
            }


            throw err;
        }

        this.bag.resolve();

        //  unset($this->bag);
    }

    protected processValue(value: any, isRoot: boolean = false): any {
        let v: string | null = null;

        if (typeof value === 'string' && value.length > 0) {
            try {
                v = this.bag.resolveValue(value);
            } catch (err) {
                if (err instanceof ParameterNotFoundException) {

                    if (this.shouldThrowExceptionOnResolve) {
                        throw err;
                    }

                    v = null;
                    // todo use pubsub to decorate error in order to use error messages
                    this.containerBuilder.getDefinition(this.currentId);//.addError(e.getMessage());
                }
            }

            return this.shouldResolveArray || !v || !(typeof v === 'object' && v !== null) ? v : value;
        }


        if (value instanceof Definition) {
            value.setBindings(this.processValue(value.getBindings()));
            const changes = value.getChanges();

            if (typeof changes['type'] !== 'undefined') {
                value.setResourceType(this.bag.resolveValue(value.getResourceType()));
            }
            if (typeof changes['file'] !== 'undefined') {
                value.setFilePath(this.bag.resolveValue(value.getFilePath()));
            }
        }

        value = super.processValue(value, isRoot);

        if (typeof value === 'object' && value !== null) {
            let resolvedValue = Array.isArray(value) ? [] : {};
            Object.keys(value).forEach(key => {
                const resolvedKey = this.bag.resolveValue(key);
                resolvedValue[resolvedKey] = value[key];
            });

            value = resolvedValue;
        }

        return value;
    }
}
