"use strict";
exports.__esModule = true;
var ReflexionService = /** @class */ (function () {
    function ReflexionService() {
    }
    /**
     * Inspired from: https://davidwalsh.name/javascript-arguments
     * @param func
     */
    ReflexionService.prototype.getFunctionArgumentsName = function (func) {
        // First match everything inside the function argument parens.
        console.log(func.toString());
        var tokens = func.toString().match(/function\s.*?\(([^)]*)\)/) || [];
        console.log('tokens', func.toString().match(/function\s.*?\(([^)]*)\)/), tokens);
        if (tokens.length < 1) {
            return tokens;
        }
        var args = tokens[1];
        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function (arg) {
            console.log(arg);
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    };
    ReflexionService.prototype.getFunctionOptionalsArgumentsName = function (func) {
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
    };
    return ReflexionService;
}());
exports["default"] = ReflexionService;
