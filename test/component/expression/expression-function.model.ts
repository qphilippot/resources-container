/**
 * Represents a that can be used in an expression.
 *
 * A "function" is defined by two PHP callables. The callables are used
 * by the language to compile and/or evaluate the "function".
 *
 * The "compiler" is used at compilation time and must return a
 * PHP representation of the call (it receives the
 * arguments as arguments).
 *
 * The "evaluator" is used for expression evaluation and must return
 * the value of the call based on the values defined for the
 * expression (it receives the values as a first argument and the
 * arguments as remaining arguments).
 *
 */
import InvalidArgumentException from "../../../src/core/exception/invalid-argument.exception";

class ExpressionFunction {
    private name;
    private compiler;
    private evaluator;

    /**
     * @param string   name      The name
     * @param callable compiler  A callable able to compile the
     * @param callable evaluator A callable able to evaluate the
     */
     constructor(name: string, compiler: (...any) => string, evaluator: (...any) => any) {
        this.name = name;
        this.compiler = compiler;
        this.evaluator = evaluator;
    }

    public getName(): string {
        return this.name;
    }

    /**
     * @return Function
     */
    public getCompiler() {
        return this.compiler;
    }

    /**
     * @return Function
     */
    public getEvaluator() {
        return this.evaluator;
    }

    /**
     * Creates an ExpressionFunction from a PHP name.
     *
     * @param string|null expressionFunctionName The expression name (default: same than the PHP name)
     *
     * @return self
     *
     * @throws \InvalidArgumentException if given PHP name does not exist
     * @throws \InvalidArgumentException if given PHP name is in namespace
     *                                   and expression name is not defined
     */
    public static fromGlobal(rawFunctionName: string, expressionFunctionName: string = '') {
        rawFunctionName = rawFunctionName.trim();

        let realFunction = null;

        if (typeof window !== 'undefined' && typeof window[rawFunctionName] !== 'function') {
            realFunction = window[rawFunctionName];
        }

        if (typeof global !== 'undefined' && typeof global[rawFunctionName] !== 'function') {
            realFunction = global[rawFunctionName];
        }

        if (realFunction === null) {
            throw new InvalidArgumentException(`Function "${rawFunctionName}" does not exist.`);
        }

        const parts = rawFunctionName.split('\\');
        if (expressionFunctionName.length === 0 && parts.length > 1) {
            throw new InvalidArgumentException(
                `An expression name must be defined when "${rawFunctionName}" is namespaced.`
            );
        }

        const compiler = (...params) => {
            return `${rawFunctionName}(${params.join(', ')})`;
        };

        const evaluator = (...params) => {
            if (typeof realFunction === 'function') {
                // @ts-ignore
                realFunction(...params);
            }
        }

        return new ExpressionFunction(
            expressionFunctionName ?? parts.pop(),
            compiler,
            evaluator
        );
    }
}
