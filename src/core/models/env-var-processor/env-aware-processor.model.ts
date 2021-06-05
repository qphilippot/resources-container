import EnvNotFoundException from "../../exception/env-not-found.exception";
import EnvVarProcessorManagerInterface from "../../interfaces/env-var-processor-manager.interface";

export default class EnvAwareProcessorModel {
    getTarget(): string {
        return 'unknown';
    }

    match(prefix: string): boolean {
        return prefix === this.getTarget();
    }

    retrieveEnv(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface) {
        const i = name.indexOf(':');
        let env : any = null;
        if (i >= 0 || prefix !== 'string') {
            env = getEnv(name);
        }
        else if (typeof process.env[name] !== 'undefined') {
            env = process.env[name];
        }
        else {
            // ?????
            // foreach ($this->loadedVars as $vars) {
            //     if (false !== $env = ($vars[$name] ?? false)) {
            //         break;
            //     }
            // }

            // env = manager.getLoadedVar().find(vars => typeof vars[name] !== 'undefined');
            // if (typeof env !== 'undefined') {
            //     $loaders = $this->loaders;
            //     $this->loaders = new \ArrayIterator();
            //
            //     try {
            //         $i = 0;
            //         $ended = true;
            //         $count = $loaders instanceof \Countable ? $loaders->count() : 0;
            //         foreach ($loaders as $loader) {
            //             if (\count($this->loadedVars) > $i++) {
            //                 continue;
            //             }
            //             $this->loadedVars[] = $vars = $loader->loadEnvVars();
            //             if (false !== $env = $vars[$name] ?? false) {
            //                 $ended = false;
            //                 break;
            //             }
            //         }
            //         if ($ended || $count === $i) {
            //             $loaders = $this->loaders;
            //         }
            //     } catch (ParameterCircularReferenceException $e) {
            //         // skip loaders that need an env var that is not defined
            //     } finally {
            //         $this->loaders = $loaders;
            //     }
            // }

            if (env === null) {
                const container = manager.getContainer();
                const parameterName = `env(${name})`;

                if (!container.hasParameter(parameterName)) {
                    throw new EnvNotFoundException(
                        `Environment variable not found: "${parameterName}".`
                    );
                }

                env = container.getParameter(parameterName);
            }
        }

        return env;

        //
        // if (!is_scalar($env)) {
        //     throw new RuntimeException(sprintf('Non-scalar env var "%s" cannot be cast to "%s".', $name, $prefix));
        // }
    }
}