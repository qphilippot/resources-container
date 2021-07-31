import FileLoader from "./file-loader.model";
import { load } from 'js-yaml';

export default class YamlLoader extends FileLoader {
    constructor() {
        super('yaml-loader');
        this.supportedExtensions.push('yaml', 'yml');
    }

    load(path: string) {
        const data = super.load(path);
        // console.log('data', data);
        // console.log('oo', JSON.stringify(load(data), null, 4));
        return load(data);
    }
}