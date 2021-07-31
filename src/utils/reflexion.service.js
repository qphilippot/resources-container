"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReflexionService {
    /**
     * Inspired from: https://davidwalsh.name/javascript-arguments
     * @param func
     */
    getFunctionArgumentsName(func) {
        // First match everything inside the function argument parens.
        const tokens = func.toString().match(/function\s.*?\(([^)]*)\)/) || [];
        if (tokens.length < 1) {
            return tokens;
        }
        const args = tokens[1];
        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }
    getFunctionOptionalsArgumentsName(func) {
        // const namedArguments = this.getFunctionArgumentsName(func);
        //
        // const optionalsArguments = [];
        // namedArguments.forEach(argumentName => {
        //     // First match everything inside the function argument parens.
        //     const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
        // });
        //
        // // Split the arguments string into an array comma delimited.
        // return args.split(',').map(function(arg) {
        //     // Ensure no inline comments are parsed and trim the whitespace.
        //     return arg.replace(/\/\*.*\*\//, '').trim();
        // }).filter(function(arg) {
        //     // Ensure no undefined values are added.
        //     return arg;
        // });
    }
}
exports.default = ReflexionService;
//# sourceMappingURL=reflexion.service.js.map