const fs = require('fs');

class MyFirstWebpackPlugin {
    constructor(options) {
        this.options = options || {
            env: "dev"
        };
    }

    apply(compiler) {
        // compiler.hooks.done.tap("MyFirstWebpackPlugin", (stats) => {
        //     console.log(`My first webpack plugin is running on ${this.options.env}`)
        //     console.log("stats", stats);
        // })

        compiler.hooks.beforeCompile.tap('MyFirstWebpackPlugin', (params, callback) => {
            fs.writeFile(
                'data.json',
                JSON.stringify(params, null, 4),
                err => {
                    console.error(err)
                }
            );

            // callback();
        });
        compiler.hooks.normalModuleFactory.tap('MyFirstWebpackPlugin', (factory) => {
            factory.hooks.parser
                // .for('javascript/auto')
                .for('javascript/auto')
                .tap('MyFirstWebpackPlugin', (parser, options) => {
                    parser.hooks.statement.tap('MyFirstWebpackPlugin', statement => {
                        if (statement.type === 'ClassDeclaration') {
                            const constructorDefinition = (statement.body?.body?.filter(
                                item => item.type === 'MethodDefinition'
                            ) || []).find(item => item?.kind === 'constructor');

                            const data = {
                                name: statement.id.name,
                                parent: statement.superClass?.name || null,
                                constructor: {
                                    parameters: (constructorDefinition?.value?.params || []).map(p => {
                                        return {
                                            name: p?.left?.name,
                                            type: typeof p?.right?.value
                                        }
                                    })
                                }
                            }

                            if (data.name === 'B') {
                                fs.writeFile(
                                    'data.json',
                                    JSON.stringify(statement, null, 4),
                                    err => {
                                        console.error(err)
                                    }
                                );

                                // console.log(JSON.stringify(statement));
                            }
                        }
                    });
                });
        });
    }
};

module.exports = MyFirstWebpackPlugin;