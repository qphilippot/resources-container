import EnvVarProcessorInterface from "../interfaces/env-var-processor-manager.interface";
import ContainerInterface from "../interfaces/container.interface";
import EnvVarLoaderInterface from "../interfaces/env-var-loader.interface";
import RuntimeException from "../exception/runtime.exception";
import EnvNotFoundException from "../exception/env-not-found.exception";

export default class EnvVarProcessor implements EnvVarProcessorInterface {
    private container: ContainerInterface;
    private loaders: EnvVarLoaderInterface[];
    private loadedVars = [];

    constructor(container: ContainerInterface, loaders: EnvVarLoaderInterface[] = []) {
        this.container = container;
        this.loaders = loaders;
    }


    getProvidedTypes() {
        return {
            'csv': 'array',
            'float': 'float',
            'json': 'array',
            'url': 'array',
            'query_string': 'array',
            'resolve': 'string',
            'trim': 'string',
            'require': 'bool|int|float|string|array',
        }
    }

    getContainer(): ContainerInterface {
        return this.container;
    }

    getLoadedVar() {
        return this.loadedVars;
    }

    getLoaders() {
        return this.loaders;
    }

    getEnv(prefix: string, name: string, getEnv: Function)
    {


if ('const' === $prefix) {
    if (!\defined($env)) {
        throw new RuntimeException(sprintf('Env var "%s" maps to undefined constant "%s".', $name, $env));
    }

    return \constant($env);
}


if ('json' === $prefix) {
    $env = json_decode($env, true);

    if (\JSON_ERROR_NONE !== json_last_error()) {
        throw new RuntimeException(sprintf('Invalid JSON in env var "%s": ', $name).json_last_error_msg());
    }

    if (null !== $env && !\is_array($env)) {
        throw new RuntimeException(sprintf('Invalid JSON env var "%s": array or null expected, "%s" given.', $name, get_debug_type($env)));
    }

    return $env;
}

if ('url' === $prefix) {
    $parsedEnv = parse_url($env);

    if (false === $parsedEnv) {
        throw new RuntimeException(sprintf('Invalid URL in env var "%s".', $name));
    }
    if (!isset($parsedEnv['scheme'], $parsedEnv['host'])) {
        throw new RuntimeException(sprintf('Invalid URL env var "%s": schema and host expected, "%s" given.', $name, $env));
    }
    $parsedEnv += [
        'port' => null,
        'user' => null,
        'pass' => null,
        'path' => null,
        'query' => null,
        'fragment' => null,
];

    if (null !== $parsedEnv['path']) {
        // remove the '/' separator
        $parsedEnv['path'] = '/' === $parsedEnv['path'] ? null : substr($parsedEnv['path'], 1);
    }

    let processor = this.processors.find(p => p.match(prefix));
    if (processor === null) {
        throw new RuntimeException(`Unsupported env var prefix "${prefix}".`);
    }

    else {
        return processor.process(prefix, name, getEnv, this);
    }
}

if ('query_string' === $prefix) {
    $queryString = parse_url($env, \PHP_URL_QUERY) ?: $env;
    parse_str($queryString, $result);

    return $result;
}

if ('resolve' === $prefix) {
    return preg_replace_callback('/%%|%([^%\s]+)%/', function ($match) use ($name) {
        if (!isset($match[1])) {
            return '%';
        }
        $value = $this->container->getParameter($match[1]);
        if (!is_scalar($value)) {
            throw new RuntimeException(sprintf('Parameter "%s" found when resolving env var "%s" must be scalar, "%s" given.', $match[1], $name, get_debug_type($value)));
        }

        return $value;
    }, $env);
}

if ('csv' === $prefix) {
    return str_getcsv($env, ',', '"', \PHP_VERSION_ID >= 70400 ? '' : '\\');
}

if ('trim' === $prefix) {
    return trim($env);
}

throw new RuntimeException(sprintf('Unsupported env var prefix "%s" for env name "%s".', $prefix, $name));
}
}
