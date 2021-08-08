import HandlerInterface from "../src/core/interfaces/handler.interface";
import { readFileSync } from 'fs';
import Publisher from "../src/publisher-subscriber/model/publisher.model";
import PublisherInterface from "../src/publisher-subscriber/interfaces/publisher.interface";

export default abstract class FileLoader extends Publisher implements HandlerInterface, PublisherInterface
{
    protected supportedExtensions: string[] = [];
    private currentDir: string = '';

    // todo check if i can remove
    setCurrentDir(dir: string) {
        this.currentDir = dir;
    }

    // todo check if i can remove
    getCurrentDir(): string {
        return this.currentDir;
    }

    process(path: string) {
        return this.load(path);
    }

    match(key: string): boolean {
        const extension = this.getExtension(key);
        return this.supportedExtensions.includes(extension);
    }

    load(path) {
        return readFileSync(path, 'utf8');
    }

    getExtension(path: string): string {
        const result = path.match(/\.[0-9a-z]+$/i);
        return result !== null ? result[0].split('.')[1] : '';
    }

}