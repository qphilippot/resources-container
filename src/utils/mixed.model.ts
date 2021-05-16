import MixedInterface from "./mixed.interface";

class Mixed implements MixedInterface {
    hasProperty(propertyName: string): boolean {
        return typeof this[propertyName] !== 'undefined';
    }
}

export default Mixed;