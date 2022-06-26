import FileLoader from "./file-loader.model";
import {DEFAULT_SCHEMA, load, Type, YAMLException} from 'js-yaml';
import InvalidArgumentException from "../src/core/exception/invalid-argument.exception";


export default class YamlLoader extends FileLoader {
    private schema;

    constructor() {
        super('yaml-loader');
        this.supportedExtensions.push('yaml', 'yml');

        this.schema = DEFAULT_SCHEMA.extend([
            new Type('!Ref', {
                kind: 'scalar',
                construct: function (keyword) {
                    switch (keyword) {
                        case 'INT_MAX':
                            return Number.MAX_SAFE_INTEGER;
                        default:
                            return undefined;
                    }
                }
            })
        ])
    }

    load(path: string) {
        const data = super.load(path);

        try {
            return load(data, { schema: this.schema });
        } catch (err) {
            if (err instanceof YAMLException) {
                throw new InvalidArgumentException(
                    `The file "${path}" does not contain valid YAML.`
                );
            }
        }
    }
}
