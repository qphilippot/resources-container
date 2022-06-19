import HandlerInterface from "../src/core/interfaces/handler.interface";
import { readFileSync } from 'fs';
import { Publisher, PublisherInterface } from "@qphi/publisher-subscriber";
import InvalidArgumentException from "../src/core/exception/invalid-argument.exception";

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
        try {
            return readFileSync(path, 'utf8');
        } catch (err) {
            if (err.message.startsWith('ENOENT:')) {
                throw new InvalidArgumentException(
                    `The file "${path}" does not exist.`
                )
            }
        }

    }

    getExtension(path: string): string {
        const result = path.match(/\.[0-9a-z]+$/i);
        return result !== null ? result[0].split('.')[1] : '';
    }

}
