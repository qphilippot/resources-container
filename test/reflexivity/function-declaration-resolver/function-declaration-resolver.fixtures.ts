export default [
    {
        it: '() => {}',
        expression: '() => {}',
        name: undefined,
        async: false,
        parameters: [],
        returnType: undefined
    },
    {
        it: 'async () => {}',
        expression: 'async () => {}',
        name: undefined,
        async: true,
        parameters: [],
        returnType: undefined
    },
    {
        it: 'function(){}',
        expression: 'function(){}',
        name: undefined,
        async: false,
        parameters: [],
        returnType: undefined
    },
    {
        it: 'function bidule() {}',
        expression: 'function bidule() {}',
        name: 'bidule',
        async: false,
        parameters: [],
        returnType: undefined
    },
    {
        it: 'function machin(chouette) {}',
        expression: 'function machin(chouette) {}',
        name: 'machin',
        async: false,
        parameters: [
            {
                name: 'chouette',
                type: 'unknown'
            }
        ],
        returnType: undefined
    },
    {
        it: 'function badaboum(truc = 8) {}',
        expression: 'function badaboum(truc = 8) {}',
        name: 'badaboum',
        async: false,
        parameters: [
            {
                name: 'truc',
                type: 'unknown',
                defaultValue: 8
            }
        ],
        returnType: undefined
    },
    {
        it: 'can parse a function with 1 param, default int value and type ',
        expression: 'function badaboum2(random: number = 3.14) {}',
        name: 'badaboum2',
        async: false,
        parameters: [
            {
                name: 'random',
                type: 'number',
                defaultValue: 3.14
            }
        ],
        returnType: undefined
    },
    {
        it: 'can parse a function with 1 param and custom type ',
        expression: 'function toto(bar: Foo) {}',
        name: 'toto',
        async: false,
        parameters: [
            {
                name: 'bar',
                type: 'Foo'
            }
        ],
        returnType: undefined
    },

    {
        expression: 'function aa(bar: number = 8, keyboard: string = "azerty") {}',
        name: 'aa',
        async: false,
        parameters: [
            {
                name: 'bar',
                type: 'number',
                defaultValue: 8
            },
            {
                name: 'keyboard',
                type: 'string',
                defaultValue: 'azerty'
            },
        ],
        returnType: undefined
    },

    {
        it: 'parse object expression {}',
        expression: 'function(o = {}) {}',
        async: false,
        parameters: [
            {
                name: 'o',
                type: 'unknown',
                defaultValue: {}
            }
        ],
        returnType: undefined
    },

    {
        it: 'function(o = {a: 10}) {}',
        expression: 'function(o = {a: 10}) {}',
        async: false,
        parameters: [
            {
                name: 'o',
                type: 'unknown',
                defaultValue: {a: 10}
            }
        ],
        returnType: undefined
    },

    // todo
    // {
    //     it: 'allow function as parameter\'s object expression property',
    //     expression: 'function(o = {foo: ()=> {}) {}',
    //     async: false,
    //     parameters: [
    //         {
    //             name: 'o',
    //             type: 'unknown',
    //             defaultValue: {foo: () => {}}
    //         }
    //     ],
    //     returnType: undefined
    // },

]
