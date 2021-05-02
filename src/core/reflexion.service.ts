class ReflexionService {
    /**
     * Inspired from: https://davidwalsh.name/javascript-arguments
     * @param func
     */
    getFunctionArgumentsName(func: Function) {
        console.log(func.toString());
        // First match everything inside the function argument parens.
        const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            console.log(arg)
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    getFunctionOptionalsArgumentsName(func: Function) {
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

export default ReflexionService;