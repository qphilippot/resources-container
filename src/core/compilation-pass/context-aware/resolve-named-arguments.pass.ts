import CompilerPassInterface from "../../interfaces/compiler-pass.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import AbstractRecursivePassModel from "../standard/abstract-recursive-pass.model";
import ContainerHelper from "../../container.helper";
import Reference from "../../models/reference.model";
import AbstractArgument from "../../models/abstract-argument.model";
import ResourceDefinition from "../../models/resource-definition.model";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import MixedInterface from "../../../utils/mixed.interface";

/**
 * Resolves named arguments to their corresponding numeric index.
 */
export default class ResolveNamedArgumentsPass extends AbstractRecursivePassModel implements CompilerPassInterface {
    protected processValue(value: any, isRoot: boolean = false): any {
        console.log('process value', value);
        if (value instanceof AbstractArgument && !value.hasContext()) {
            value.setContext(`A value found in service ${this.currentId}`);
        }

        if (!(value instanceof ResourceDefinition)) {
            return super.processValue(value, isRoot);
        }

        // because of previous if-statement, we know that value is an instance of ResourceDefinition
        const calls: Array<any> = value.getMethodCalls();
        calls.push(['constructor', value.getArguments()]);

        calls.forEach(call => {
            const method = call[0];
            const args = call[1];
            let parameters = null;
            const resolvedArgs: MixedInterface = {};

            console.log('call', method, args);
            Object.keys(args).forEach((keyName: string) => {
                // may be an integer (array index) or string according to named parameter usage
                const key: string | number = (Number.isNaN(parseInt(keyName))) ? keyName : parseInt(keyName);
                console.log('key', key, typeof key === 'number');
                const arg = args[key];
                if (arg instanceof AbstractArgument && !arg.hasContext()) {
                    const caller = method === 'constructor'
                        ? `resource ${this.currentId}`
                        : `method call ${this.currentId}::${method}`;

                    arg.setContext(`Argument ${key} of ${caller}`);
                }


                console.log('reflexion', value, method);
                if (typeof key === 'number') {
                    resolvedArgs[key] = arg;
                    return;
                }
            });



            //


                // todo need reflection method
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

        value.getProperties().forEach((property, index) => {
           if (property instanceof AbstractArgument && !property.hasContext()) {
               property.setContext(`Property "${this.currentId}" of service "${this.currentId}"`);
           }
        });

        return super.processValue(value, isRoot);
    }
};
