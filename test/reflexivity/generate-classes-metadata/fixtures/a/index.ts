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
            },
        ],
    },

    result: {
        "app/abstract/someAbstract": {
            "kind": "class",
            "namespace": "app/abstract",
            "name": "AbstractABC",
            "superClass": null,
            "abstract": true,
            "implements": [],
            "constructor": [],
            "methods": {},
            "imports": [],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\abstract\\some-abstract.ts",
                "type": "export:named"
            }
        },
        "app/bob": {
            "kind": "class",
            "namespace": "app",
            "name": "Bob",
            "superClass": {
                "name": "ParentClass",
                "namespace": "app/parentClass"
            },
            "abstract": false,
            "implements": [
                {
                    "name": "BobInterface",
                    "namespace": "app/bobInterface"
                },
                {
                    "name": "VoidInterface",
                    "namespace": "app/VoidInterface"
                }
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
            },
            "imports": [
                {
                    "name": "ParentClass",
                    "namespace": "app/parentClass"
                },
                {
                    "name": "BobInterface",
                    "namespace": "app/bobInterface"
                },
                {
                    "name": "VoidInterface",
                    "namespace": "app/VoidInterface"
                }
            ],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\bob.ts",
                "type": "export:default"
            }
        },
        "app/bobInterface": {
            "kind": "interface",
            "namespace": "app",
            "name": "BobInterface",
            "implements": [],
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
                    "returnType": "unknown until babel 8.0"
                }
            },
            "imports": [],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\bobInterface.ts",
                "type": "export:default"
            }
        },
        "app/exportSapristi::exportsapristi": {
            "kind": "class",
            "namespace": "app",
            "name": "ExportSapristi",
            "superClass": null,
            "abstract": false,
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
                    "parameters": [],
                    "returnType": "void"
                }
            },
            "imports": [
                {
                    "name": "AbstractABC",
                    "namespace": "app/abstract/someAbstract"
                }
            ],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\export-sapristi.ts",
                "type": "export:named"
            }
        },
        "app/exportSapristi::abc": {
            "kind": "class",
            "namespace": "app",
            "name": "ABC",
            "superClass": {
                "name": "AbstractABC",
                "namespace": "app/abstract/someAbstract"
            },
            "abstract": false,
            "implements": [],
            "constructor": [],
            "methods": {},
            "imports": [
                {
                    "name": "AbstractABC",
                    "namespace": "app/abstract/someAbstract"
                }
            ],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\export-sapristi.ts",
                "type": "export:named"
            }
        },
        "app/parentClass": {
            "kind": "class",
            "namespace": "app",
            "name": "ParentClass",
            "superClass": null,
            "abstract": false,
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
            },
            "imports": [],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\parent-class.ts",
                "type": "export:default"
            }
        },
        "app/sapristi": {
            "kind": "class",
            "namespace": "app",
            "name": "Sapristi",
            "superClass": null,
            "abstract": false,
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
                    "parameters": [],
                    "returnType": "void"
                }
            },
            "imports": [
                {
                    "name": "handlerInterface",
                    "namespace": "C:/Users/Quentin/resourcesContainer/src/core/interfaces/handlerInterface"
                },
                {
                    "name": "ContainerBuilderInterface",
                    "namespace": "C:/Users/Quentin/resourcesContainer/src/core/interfaces/containerBuilderInterface"
                }
            ],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\sapristi.ts",
                "type": "export:default"
            }
        },
        "app/tom": {
            "kind": "class",
            "namespace": "app",
            "name": "Tom",
            "superClass": {
                "name": "ParentClass",
                "namespace": "app/parentClass"
            },
            "abstract": false,
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
            },
            "imports": [
                {
                    "name": "ParentClass",
                    "namespace": "app/parentClass"
                }
            ],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\tom.ts",
                "type": "export:default"
            }
        },
        "app/VoidInterface": {
            "kind": "interface",
            "namespace": "app",
            "name": "VoidInterface",
            "implements": [],
            "methods": {},
            "imports": [],
            "export": {
                "path": "C:\\Users\\Quentin\\resources-container\\test\\reflexivity\\generate-classes-metadata\\fixtures\\a\\classes\\VoidInterface.ts",
                "type": "export:default"
            }
        }
    }
};
