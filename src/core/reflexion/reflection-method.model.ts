import ReflectionMethodInterface from "./reflection-method.interface";
import {ReflexionMethodVisibility} from "./reflection-method.config";
import ReflectionParameterInterface from "./reflection-parameter.interface";

export type ReflectionMethodConstructorPayload = {
    visibility: ReflexionMethodVisibility,
    isStatic: boolean,
    isAbstract: boolean,
    isConstructor: boolean,
    parameters: ReflectionParameterInterface[]
}
export default class ReflectionMethod implements ReflectionMethodInterface {
    private readonly visibility: ReflexionMethodVisibility;
    private readonly _isStatic: boolean;
    private readonly _isAbstract: boolean;
    private readonly _isConstructor: boolean;
    private readonly parameters: ReflectionParameterInterface[];

    constructor({visibility, isStatic, isAbstract, isConstructor, parameters}: ReflectionMethodConstructorPayload) {
        this.visibility = visibility;
        this._isStatic = isStatic;
        this._isAbstract = isAbstract;
        this._isConstructor = isConstructor;
        this.parameters = parameters;
    }

    public isAbstract(): boolean {
        return this._isAbstract;
    }

    public isConstructor(): boolean {
        return this._isConstructor;
    }

    public isPrivate(): boolean {
        return this.visibility === ReflexionMethodVisibility.PRIVATE;
    }

    public isProtected(): boolean {
        return this.visibility === ReflexionMethodVisibility.PROTECTED;
    }

    public isPublic(): boolean {
        return this.visibility === ReflexionMethodVisibility.PUBLIC;
    }

    public isStatic(): boolean {
        return this._isStatic;
    }

    public getParameters(): ReflectionParameterInterface[] {
        return this.parameters;
    }

    public getParameter(name: string): ReflectionParameterInterface {
        const parameter = this.parameters.find(parameter => parameter.getName() === name);
        if (!parameter) {
            // todo inject name + dedicated error
            throw `Unable to find parameter "${name}" in method ""`
        }

        return parameter;
    }
}
