import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import AbstractRecursivePassModel from "../standard/abstract-recursive-pass.model";
import AbstractArgument from "../../models/abstract-argument.model";
import Definition from "../../models/definition.model";
import MixedInterface from "../../../utils/mixed.interface";

/**
 * Resolves named arguments to their corresponding numeric index.
 * TODO: frozen cause we need reflection method to check which name have arguments in methods
 */
export default class ResolveNamedArgumentsPass extends AbstractRecursivePassModel implements CompilerPassInterface {
    protected processValue(value: any, isRoot: boolean = false): any {
        if (value instanceof AbstractArgument && !value.hasContext()) {
            value.setContext(`A value found in service "${this.currentId}"`);
        }

        if (!(value instanceof Definition)) {
            return super.processValue(value, isRoot);
        }

        // because of previous if-statement, we know that value is an instance of ResourceDefinition
        const calls: Array<any> = value.getMethodCalls();
        calls.push(['constructor', value.getArguments()]);


        // todo modifier car je n'aime pas trop modifier la collection sur laquelle on itère
        calls.forEach((call, callerIndex) => {
            const [ method, args ] = call;
            const parameters = null;
            const resolvedArgs: MixedInterface = {};

            Object.keys(args).forEach((keyName: string) => {
                // may be an integer (array index) or string according to named parameter usage
                const key: string | number = (Number.isNaN(parseInt(keyName))) ? keyName : parseInt(keyName);
                const arg = args[key];
                if (arg instanceof AbstractArgument && !arg.hasContext()) {
                    const caller = method === 'constructor'
                        ? `resource ${this.currentId}`
                        : `method ${this.currentId}::${method}`;

                    arg.setContext(`Argument ${key} of ${caller}`);
                }

                if (Number.isInteger(key) && key >= 0 && !Number.isNaN(key)) {
                    resolvedArgs[key] = arg;
                    return;
                }
                // todo need reflection method
                resolvedArgs[key] = arg;
                //if (null === $parameters) {
                //                     $r = $this->getReflectionMethod($value, $method);
                //                     $class = $r instanceof \ReflectionMethod ? $r->class : $this->currentId;
                //                     $method = $r->getName();
                //                     $parameters = $r->getParameters();
                //                 }
                //
                //                 if (isset($key[0]) && '$' !== $key[0] && !class_exists($key) && !interface_exists($key, false)) {
                //                     throw new InvalidArgumentException(sprintf('Invalid service "%s": did you forget to add the "$" prefix to argument "%s"?', $this->currentId, $key));
                //                 }
                //
                //                 if (isset($key[0]) && '$' === $key[0]) {
                //                     foreach ($parameters as $j => $p) {
                //                         if ($key === '$'.$p->name) {
                //                             if ($p->isVariadic() && \is_array($argument)) {
                //                                 foreach ($argument as $variadicArgument) {
                //                                     $resolvedArguments[$j++] = $variadicArgument;
                //                                 }
                //                             } else {
                //                                 $resolvedArguments[$j] = $argument;
                //                             }
                //
                //                             continue 2;
                //                         }
                //                     }
                //
                //                     throw new InvalidArgumentException(sprintf('Invalid service "%s": method "%s()" has no argument named "%s". Check your service definition.', $this->currentId, $class !== $this->currentId ? $class.'::'.$method : $method, $key));
                //                 }
                //
                //                 if (null !== $argument && !$argument instanceof Reference && !$argument instanceof Definition) {
                //                     throw new InvalidArgumentException(sprintf('Invalid service "%s": the value of argument "%s" of method "%s()" must be null, an instance of "%s" or an instance of "%s", "%s" given.', $this->currentId, $key, $class !== $this->currentId ? $class.'::'.$method : $method, Reference::class, Definition::class, get_debug_type($argument)));
                //                 }
                //
                //                 $typeFound = false;
                //                 foreach ($parameters as $j => $p) {
                //                     if (!\array_key_exists($j, $resolvedArguments) && ProxyHelper::getTypeHint($r, $p, true) === $key) {
                //                         $resolvedArguments[$j] = $argument;
                //                         $typeFound = true;
                //                     }
                //                 }
                //
                //                 if (!$typeFound) {
                //                     throw new InvalidArgumentException(sprintf('Invalid service "%s": method "%s()" has no argument type-hinted as "%s". Check your service definition.', $this->currentId, $class !== $this->currentId ? $class.'::'.$method : $method, $key));
                //                 }

                // argIterator++;
            });



            //



            // }
            //
            // if (resolvedArgs !== call[1]) {
            //     resolvedArgs.sort();
            //     calls[callsIterator][1] = resolvedArgs;
            // }
        });


        const args = calls.pop()[1];

        if (args !== value.getArguments()) {
            value.setArguments(args);
        }

        if (calls !== value.getMethodCalls()) {
            value.setMethodCalls(calls);
        }

        // Object.values(value.getInjectionProperties()).forEach((property, index) => {
        //    if (property instanceof AbstractArgument && !property.hasContext()) {
        //        property.setContext(`Property "${this.currentId}" of service "${this.currentId}"`);
        //    }
        // });

        return super.processValue(value, isRoot);
    }
}
