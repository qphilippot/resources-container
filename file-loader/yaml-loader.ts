import FileLoader from "./file-loader.model";
import { load, YAMLException } from 'js-yaml';
import InvalidIdException from "../src/core/exception/invalid-id.exception";
import InvalidArgumentException from "../src/core/exception/invalid-argument.exception";

export default class YamlLoader extends FileLoader {
    constructor() {
        super('yaml-loader');
        this.supportedExtensions.push('yaml', 'yml');
    }

    load(path: string) {
        const data = super.load(path);

        try {
            return load(data);
        } catch (err) {
            if (err instanceof YAMLException) {
                throw new InvalidArgumentException(
                    `The file "${path}" does not contain valid YAML.`
                );
            }
        }
    }
}
