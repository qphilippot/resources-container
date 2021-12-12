import MixedInterface from "./mixed.interface";

class FlexibleService {
    public set(propertyPath: string, value: any, instance: MixedInterface, separator:string = '.') {
        const tokens = propertyPath.split(separator);

        let node: MixedInterface = instance;
        let lastNode = instance;
        let lastToken;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.length === 0) {
                throw `Invalid instance id`;
            }

            if (typeof node[token] === 'undefined') {
                node[token] = {};
            }

            lastNode = node;
            node = node[token];
            lastToken = token;
        }

        lastNode[lastToken] = value;
        return instance;
    }

    public get(id: string, instance: object, separator: string = '.') : any | null {
        const tokens = id.split(separator);

        let node = instance;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.length === 0) {
                throw `Invalid instance id`;
            }

            if (typeof node[token] === 'undefined') {
                return null;
            }

            node = node[token];
        }

        return node;
    }
}

export default FlexibleService;
