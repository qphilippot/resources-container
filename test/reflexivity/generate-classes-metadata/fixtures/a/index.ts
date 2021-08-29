import {resolve} from "path";

const path = resolve(__dirname, './classes');

export default {
    options: {
        path,
        debug: true,
        aliasRules: [
            {
                replace: path,
                by: 'app'
            }
        ],
    },

    result: {
        "app.bob": {
            "name": "Bob",
            "superClass": "ParentClass",
            "implements": [
                "BobInterface",
                "VoidInterface"
            ],
            "constructor": [
                {
                    "name": "settings",
                    "type": "unknown",
                    "defaultValue": {}
                }
            ],
            "methods": {
                "someFunction": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "someFunction",
                    "parameters": [
                        {
                            "name": "p1",
                            "type": "unknown"
                        }
                    ]
                }
            }
        },
        "app.parent-class": {
            "name": "ParentClass",
            "implements": [],
            "constructor": [
                {
                    "name": "settings",
                    "type": "unknown",
                    "defaultValue": {}
                }
            ],
            "methods": {
                "enableToto": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "enableToto",
                    "parameters": []
                },
                "disableToto": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "disableToto",
                    "parameters": []
                }
            }
        },
        "app.tom": {
            "name": "Tom",
            "superClass": "ParentClass",
            "implements": [],
            "constructor": [
                {
                    "name": "settings",
                    "type": "unknown",
                    "defaultValue": {}
                }
            ],
            "methods": {
                "whatIsIt": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "whatIsIt",
                    "parameters": []
                },
                "doSomethingAsync": {
                    "static": false,
                    "computed": false,
                    "async": true,
                    "name": "doSomethingAsync",
                    "parameters": []
                }
            }
        }
    }
};