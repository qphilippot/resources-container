import InvalidArgumentException from "../../exception/invalid-argument.exception";
import Alias from "../alias.model";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";

export default class YamlDefinitionParser {
    private container: ContainerBuilderInterface;

    public setContainer(container: ContainerBuilderInterface) {
        this.container = container;
    }

    public checkResourceIdSanity(id: string) {
        if (id.match(/^_[a-zA-Z0-9_]*$/)) {
            throw new InvalidArgumentException(
                `Resource names that start with an underscore are reserved. Rename the "${id}" service.`
            );
        }
    }

    public parse(id: string, resource: object | string | null, path: string, defaults = {}, shouldReturn = false) {
        this.checkResourceIdSanity(id);

        if (typeof resource === 'string' && resource.startsWith('@')) {
            const alias = new Alias(resource.substring(1));

            if (typeof defaults['public'] === 'boolean') {
                alias.setPublic(defaults['public']);
            }

            return shouldReturn ? alias : this.container.setAlias(id, alias);
        }


    //     if (\is_array($service) && $this->isUsingShortSyntax($service)) {
        //             $service = ['arguments' => $service];
        //         }
        //
            if (null === resource) {
                resource = [];
            }

            if (!Array.isArray(resource)) {
                throw new InvalidArgumentException(
                    `A service definition must be an array or a string starting with "@" but "${typeof resource}" found for service "${id}" in "${path}". Check your YAML syntax.`
                );
            }
        //
        //         if (!\is_array($service)) {
        //             throw new InvalidArgumentException(sprintf('A service definition must be an array or a string starting with "@" but "%s" found for service "%s" in "%s". Check your YAML syntax.', get_debug_type($service), $id, $file));
        //         }
        //
        //         if (isset($service['stack'])) {
        //             if (!\is_array($service['stack'])) {
        //                 throw new InvalidArgumentException(sprintf('A stack must be an array of definitions, "%s" given for service "%s" in "%s". Check your YAML syntax.', get_debug_type($service), $id, $file));
        //             }
        //
        //             $stack = [];
        //
        //             foreach ($service['stack'] as $k => $frame) {
        //                 if (\is_array($frame) && 1 === \count($frame) && !isset(self::SERVICE_KEYWORDS[key($frame)])) {
        //                     $frame = [
        //                         'class' => key($frame),
        //                         'arguments' => current($frame),
        //                     ];
        //                 }
        //
        //                 if (\is_array($frame) && isset($frame['stack'])) {
        //                     throw new InvalidArgumentException(sprintf('Service stack "%s" cannot contain another stack in "%s".', $id, $file));
        //                 }
        //
        //                 $definition = $this->parseDefinition($id.'" at index "'.$k, $frame, $file, $defaults, true);
        //
        //                 if ($definition instanceof Definition) {
        //                     $definition->setInstanceofConditionals($this->instanceof);
        //                 }
        //
        //                 $stack[$k] = $definition;
        //             }
        //
        //             if ($diff = array_diff(array_keys($service), ['stack', 'public', 'deprecated'])) {
        //                 throw new InvalidArgumentException(sprintf('Invalid attribute "%s"; supported ones are "public" and "deprecated" for service "%s" in "%s". Check your YAML syntax.', implode('", "', $diff), $id, $file));
        //             }
        //
        //             $service = [
        //                 'parent' => '',
        //                 'arguments' => $stack,
        //                 'tags' => ['container.stack'],
        //                 'public' => $service['public'] ?? null,
        //                 'deprecated' => $service['deprecated'] ?? null,
        //             ];
        //         }
        //
        //         $definition = isset($service[0]) && $service[0] instanceof Definition ? array_shift($service) : null;
        //         $return = null === $definition ? $return : true;
        //
        //         $this->checkDefinition($id, $service, $file);
        //
        //         if (isset($service['alias'])) {
        //             $alias = new Alias($service['alias']);
        //
        //             if (isset($service['public'])) {
        //                 $alias->setPublic($service['public']);
        //             } elseif (isset($defaults['public'])) {
        //                 $alias->setPublic($defaults['public']);
        //             }
        //
        //             foreach ($service as $key => $value) {
        //                 if (!\in_array($key, ['alias', 'public', 'deprecated'])) {
        //                     throw new InvalidArgumentException(sprintf('The configuration key "%s" is unsupported for the service "%s" which is defined as an alias in "%s". Allowed configuration keys for service aliases are "alias", "public" and "deprecated".', $key, $id, $file));
        //                 }
        //
        //                 if ('deprecated' === $key) {
        //                     $deprecation = \is_array($value) ? $value : ['message' => $value];
        //
        //                     if (!isset($deprecation['package'])) {
        //                         throw new InvalidArgumentException(sprintf('Missing attribute "package" of the "deprecated" option in "%s".', $file));
        //                     }
        //
        //                     if (!isset($deprecation['version'])) {
        //                         throw new InvalidArgumentException(sprintf('Missing attribute "version" of the "deprecated" option in "%s".', $file));
        //                     }
        //
        //                     $alias->setDeprecated($deprecation['package'] ?? '', $deprecation['version'] ?? '', $deprecation['message'] ?? '');
        //                 }
        //             }
        //
        //             return $return ? $alias : $this->container->setAlias($id, $alias);
        //         }
        //
        //         if (null !== $definition) {
        //             // no-op
        //         } elseif ($this->isLoadingInstanceof) {
        //             $definition = new ChildDefinition('');
        //         } elseif (isset($service['parent'])) {
        //             if ('' !== $service['parent'] && '@' === $service['parent'][0]) {
        //                 throw new InvalidArgumentException(sprintf('The value of the "parent" option for the "%s" service must be the id of the service without the "@" prefix (replace "%s" with "%s").', $id, $service['parent'], substr($service['parent'], 1)));
        //             }
        //
        //             $definition = new ChildDefinition($service['parent']);
        //         } else {
        //             $definition = new Definition();
        //         }
        //
        //         if (isset($defaults['public'])) {
        //             $definition->setPublic($defaults['public']);
        //         }
        //         if (isset($defaults['autowire'])) {
        //             $definition->setAutowired($defaults['autowire']);
        //         }
        //         if (isset($defaults['autoconfigure'])) {
        //             $definition->setAutoconfigured($defaults['autoconfigure']);
        //         }
        //
        //         $definition->setChanges([]);
        //
        //         if (isset($service['class'])) {
        //             $definition->setClass($service['class']);
        //         }
        //
        //         if (isset($service['shared'])) {
        //             $definition->setShared($service['shared']);
        //         }
        //
        //         if (isset($service['synthetic'])) {
        //             $definition->setSynthetic($service['synthetic']);
        //         }
        //
        //         if (isset($service['lazy'])) {
        //             $definition->setLazy((bool) $service['lazy']);
        //             if (\is_string($service['lazy'])) {
        //                 $definition->addTag('proxy', ['interface' => $service['lazy']]);
        //             }
        //         }
        //
        //         if (isset($service['public'])) {
        //             $definition->setPublic($service['public']);
        //         }
        //
        //         if (isset($service['abstract'])) {
        //             $definition->setAbstract($service['abstract']);
        //         }
        //
        //         if (isset($service['deprecated'])) {
        //             $deprecation = \is_array($service['deprecated']) ? $service['deprecated'] : ['message' => $service['deprecated']];
        //
        //             if (!isset($deprecation['package'])) {
        //                 throw new InvalidArgumentException(sprintf('Missing attribute "package" of the "deprecated" option in "%s".', $file));
        //             }
        //
        //             if (!isset($deprecation['version'])) {
        //                 throw new InvalidArgumentException(sprintf('Missing attribute "version" of the "deprecated" option in "%s".', $file));
        //             }
        //
        //             $definition->setDeprecated($deprecation['package'] ?? '', $deprecation['version'] ?? '', $deprecation['message'] ?? '');
        //         }
        //
        //         if (isset($service['factory'])) {
        //             $definition->setFactory($this->parseCallable($service['factory'], 'factory', $id, $file));
        //         }
        //
        //         if (isset($service['file'])) {
        //             $definition->setFile($service['file']);
        //         }
        //
        //         if (isset($service['arguments'])) {
        //             $definition->setArguments($this->resolveServices($service['arguments'], $file));
        //         }
        //
        //         if (isset($service['properties'])) {
        //             $definition->setProperties($this->resolveServices($service['properties'], $file));
        //         }
        //
        //         if (isset($service['configurator'])) {
        //             $definition->setConfigurator($this->parseCallable($service['configurator'], 'configurator', $id, $file));
        //         }
        //
        //         if (isset($service['calls'])) {
        //             if (!\is_array($service['calls'])) {
        //                 throw new InvalidArgumentException(sprintf('Parameter "calls" must be an array for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //             }
        //
        //             foreach ($service['calls'] as $k => $call) {
        //                 if (!\is_array($call) && (!\is_string($k) || !$call instanceof TaggedValue)) {
        //                     throw new InvalidArgumentException(sprintf('Invalid method call for service "%s": expected map or array, "%s" given in "%s".', $id, $call instanceof TaggedValue ? '!'.$call->getTag() : get_debug_type($call), $file));
        //                 }
        //
        //                 if (\is_string($k)) {
        //                     throw new InvalidArgumentException(sprintf('Invalid method call for service "%s", did you forgot a leading dash before "%s: ..." in "%s"?', $id, $k, $file));
        //                 }
        //
        //                 if (isset($call['method']) && \is_string($call['method'])) {
        //                     $method = $call['method'];
        //                     $args = $call['arguments'] ?? [];
        //                     $returnsClone = $call['returns_clone'] ?? false;
        //                 } else {
        //                     if (1 === \count($call) && \is_string(key($call))) {
        //                         $method = key($call);
        //                         $args = $call[$method];
        //
        //                         if ($args instanceof TaggedValue) {
        //                             if ('returns_clone' !== $args->getTag()) {
        //                                 throw new InvalidArgumentException(sprintf('Unsupported tag "!%s", did you mean "!returns_clone" for service "%s" in "%s"?', $args->getTag(), $id, $file));
        //                             }
        //
        //                             $returnsClone = true;
        //                             $args = $args->getValue();
        //                         } else {
        //                             $returnsClone = false;
        //                         }
        //                     } elseif (empty($call[0])) {
        //                         throw new InvalidArgumentException(sprintf('Invalid call for service "%s": the method must be defined as the first index of an array or as the only key of a map in "%s".', $id, $file));
        //                     } else {
        //                         $method = $call[0];
        //                         $args = $call[1] ?? [];
        //                         $returnsClone = $call[2] ?? false;
        //                     }
        //                 }
        //
        //                 if (!\is_array($args)) {
        //                     throw new InvalidArgumentException(sprintf('The second parameter for function call "%s" must be an array of its arguments for service "%s" in "%s". Check your YAML syntax.', $method, $id, $file));
        //                 }
        //
        //                 $args = $this->resolveServices($args, $file);
        //                 $definition->addMethodCall($method, $args, $returnsClone);
        //             }
        //         }
        //
        //         $tags = $service['tags'] ?? [];
        //         if (!\is_array($tags)) {
        //             throw new InvalidArgumentException(sprintf('Parameter "tags" must be an array for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //         }
        //
        //         if (isset($defaults['tags'])) {
        //             $tags = array_merge($tags, $defaults['tags']);
        //         }
        //
        //         foreach ($tags as $tag) {
        //             if (!\is_array($tag)) {
        //                 $tag = ['name' => $tag];
        //             }
        //
        //             if (1 === \count($tag) && \is_array(current($tag))) {
        //                 $name = key($tag);
        //                 $tag = current($tag);
        //             } else {
        //                 if (!isset($tag['name'])) {
        //                     throw new InvalidArgumentException(sprintf('A "tags" entry is missing a "name" key for service "%s" in "%s".', $id, $file));
        //                 }
        //                 $name = $tag['name'];
        //                 unset($tag['name']);
        //             }
        //
        //             if (!\is_string($name) || '' === $name) {
        //                 throw new InvalidArgumentException(sprintf('The tag name for service "%s" in "%s" must be a non-empty string.', $id, $file));
        //             }
        //
        //             foreach ($tag as $attribute => $value) {
        //                 if (!is_scalar($value) && null !== $value) {
        //                     throw new InvalidArgumentException(sprintf('A "tags" attribute must be of a scalar-type for service "%s", tag "%s", attribute "%s" in "%s". Check your YAML syntax.', $id, $name, $attribute, $file));
        //                 }
        //             }
        //
        //             $definition->addTag($name, $tag);
        //         }
        //
        //         if (null !== $decorates = $service['decorates'] ?? null) {
        //             if ('' !== $decorates && '@' === $decorates[0]) {
        //                 throw new InvalidArgumentException(sprintf('The value of the "decorates" option for the "%s" service must be the id of the service without the "@" prefix (replace "%s" with "%s").', $id, $service['decorates'], substr($decorates, 1)));
        //             }
        //
        //             $decorationOnInvalid = \array_key_exists('decoration_on_invalid', $service) ? $service['decoration_on_invalid'] : 'exception';
        //             if ('exception' === $decorationOnInvalid) {
        //                 $invalidBehavior = ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE;
        //             } elseif ('ignore' === $decorationOnInvalid) {
        //                 $invalidBehavior = ContainerInterface::IGNORE_ON_INVALID_REFERENCE;
        //             } elseif (null === $decorationOnInvalid) {
        //                 $invalidBehavior = ContainerInterface::NULL_ON_INVALID_REFERENCE;
        //             } elseif ('null' === $decorationOnInvalid) {
        //                 throw new InvalidArgumentException(sprintf('Invalid value "%s" for attribute "decoration_on_invalid" on service "%s". Did you mean null (without quotes) in "%s"?', $decorationOnInvalid, $id, $file));
        //             } else {
        //                 throw new InvalidArgumentException(sprintf('Invalid value "%s" for attribute "decoration_on_invalid" on service "%s". Did you mean "exception", "ignore" or null in "%s"?', $decorationOnInvalid, $id, $file));
        //             }
        //
        //             $renameId = $service['decoration_inner_name'] ?? null;
        //             $priority = $service['decoration_priority'] ?? 0;
        //
        //             $definition->setDecoratedService($decorates, $renameId, $priority, $invalidBehavior);
        //         }
        //
        //         if (isset($service['autowire'])) {
        //             $definition->setAutowired($service['autowire']);
        //         }
        //
        //         if (isset($defaults['bind']) || isset($service['bind'])) {
        //             // deep clone, to avoid multiple process of the same instance in the passes
        //             $bindings = $definition->getBindings();
        //             $bindings += isset($defaults['bind']) ? unserialize(serialize($defaults['bind'])) : [];
        //
        //             if (isset($service['bind'])) {
        //                 if (!\is_array($service['bind'])) {
        //                     throw new InvalidArgumentException(sprintf('Parameter "bind" must be an array for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //                 }
        //
        //                 $bindings = array_merge($bindings, $this->resolveServices($service['bind'], $file));
        //                 $bindingType = $this->isLoadingInstanceof ? BoundArgument::INSTANCEOF_BINDING : BoundArgument::SERVICE_BINDING;
        //                 foreach ($bindings as $argument => $value) {
        //                     if (!$value instanceof BoundArgument) {
        //                         $bindings[$argument] = new BoundArgument($value, $trackBindings, $bindingType, $file);
        //                     }
        //                 }
        //             }
        //
        //             $definition->setBindings($bindings);
        //         }
        //
        //         if (isset($service['autoconfigure'])) {
        //             $definition->setAutoconfigured($service['autoconfigure']);
        //         }
        //
        //         if (\array_key_exists('namespace', $service) && !\array_key_exists('resource', $service)) {
        //             throw new InvalidArgumentException(sprintf('A "resource" attribute must be set when the "namespace" attribute is set for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //         }
        //
        //         if ($return) {
        //             if (\array_key_exists('resource', $service)) {
        //                 throw new InvalidArgumentException(sprintf('Invalid "resource" attribute found for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //             }
        //
        //             return $definition;
        //         }
        //
        //         if (\array_key_exists('resource', $service)) {
        //             if (!\is_string($service['resource'])) {
        //                 throw new InvalidArgumentException(sprintf('A "resource" attribute must be of type string for service "%s" in "%s". Check your YAML syntax.', $id, $file));
        //             }
        //             $exclude = $service['exclude'] ?? null;
        //             $namespace = $service['namespace'] ?? $id;
        //             $this->registerClasses($definition, $namespace, $service['resource'], $exclude);
        //         } else {
        //             $this->setDefinition($id, $definition);
        //         }

    }
}
