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
                    ],
                    "returnType": "unknown"
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
                    "parameters": [],
                    "returnType": "unknown"
                },
                "disableToto": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "disableToto",
                    "parameters": [],
                    "returnType": "unknown"
                }
            }
        },
        "app.sapristi": {
            "name": "Sapristi",
            "implements": [],
            "constructor": [
                {
                    "name": "id",
                    "type": "unknown"
                }
            ],
            "methods": {
                "initializeHandler": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "initializeHandler",
                    "parameters": [],
                    "returnType": "unknown"
                },
                "addHandler": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "addHandler",
                    "parameters": [
                        {
                            "name": "handler",
                            "type": "handlerInterface"
                        },
                        {
                            "name": "name",
                            "type": "string"
                        }
                    ],
                    "returnType": "unknown"
                },
                "removeHandler": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "removeHandler",
                    "parameters": [
                        {
                            "name": "name",
                            "type": "string"
                        }
                    ],
                    "returnType": "unknown"
                },
                "load": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "load",
                    "parameters": [
                        {
                            "name": "path",
                            "type": "string"
                        },
                        {
                            "name": "container",
                            "type": "ContainerBuilderInterface"
                        }
                    ],
                    "returnType": "unknown"
                },
                "parseResources": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "parseResources",
                    "parameters": [
                        {
                            "name": "parameters",
                            "type": "unknown"
                        },
                        {
                            "name": "path",
                            "type": "unknown"
                        },
                        {
                            "name": "container",
                            "type": "ContainerBuilderInterface"
                        }
                    ],
                    "returnType": "unknown"
                },
                "parseDefaults": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "parseDefaults",
                    "parameters": [
                        {
                            "name": "parameters",
                            "type": "unknown"
                        },
                        {
                            "name": "path",
                            "type": "string"
                        }
                    ],
                    "returnType": "unknown"
                },
                "parseDefinition": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "parseDefinition",
                    "parameters": [
                        {
                            "name": "id",
                            "type": "string"
                        },
                        {
                            "name": "resource",
                            "type": "object|string|null"
                        },
                        {
                            "name": "path",
                            "type": "string"
                        },
                        {
                            "name": "defaults",
                            "type": "unknown"
                        },
                        {
                            "name": "shouldReturn",
                            "type": "unknown",
                            "defaultValue": false
                        }
                    ],
                    "returnType": "unknown"
                },
                "resolveInstanceOf": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "resolveInstanceOf",
                    "parameters": [
                        {
                            "name": "_instanceof",
                            "type": "unknown"
                        },
                        {
                            "name": "path",
                            "type": "unknown"
                        },
                        {
                            "name": "container",
                            "type": "ContainerBuilderInterface"
                        }
                    ],
                    "returnType": "unknown"
                },
                "parseParameters": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "parseParameters",
                    "parameters": [
                        {
                            "name": "parameters",
                            "type": "unknown"
                        },
                        {
                            "name": "path",
                            "type": "unknown"
                        },
                        {
                            "name": "container",
                            "type": "ContainerBuilderInterface"
                        }
                    ],
                    "returnType": "unknown"
                },
                "resolveValue": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "resolveValue",
                    "parameters": [
                        {
                            "name": "value",
                            "type": "unknown"
                        }
                    ],
                    "returnType": "unknown"
                },
                "parseImport": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "parseImport",
                    "parameters": [
                        {
                            "name": "content",
                            "type": "unknown"
                        },
                        {
                            "name": "path",
                            "type": "string"
                        },
                        {
                            "name": "container",
                            "type": "ContainerBuilderInterface"
                        }
                    ],
                    "returnType": "unknown"
                },
                "match": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "match",
                    "parameters": [
                        {
                            "name": "key",
                            "type": "string"
                        }
                    ],
                    "returnType": "boolean"
                },
                "process": {
                    "static": false,
                    "computed": false,
                    "async": false,
                    "name": "process",
                    "parameters": [
                        {
                            "type": "object"
                        }
                    ],
                    "returnType": "unknown"
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
                    "parameters": [],
                    "returnType": "string"
                },
                "doSomethingAsync": {
                    "static": false,
                    "computed": false,
                    "async": true,
                    "name": "doSomethingAsync",
                    "parameters": [],
                    "returnType": "unknown"
                }
            }
        }
    }
};
