import ReflectionMethodInterface from "./reflection-method.interface";
import {ReflexionMethodVisibility} from "./reflection-method.config";

export type ReflectionMethodConstructorPayload = {
    visibility: ReflexionMethodVisibility,
    isStatic: boolean,
    isAbstract: boolean,
    isConstructor: boolean
}
export default class ReflectionMethod implements ReflectionMethodInterface {
    private readonly visibility: ReflexionMethodVisibility;
    private readonly _isStatic: boolean;
    private readonly _isAbstract: boolean;
    private readonly _isConstructor: boolean;

    constructor({visibility, isStatic, isAbstract, isConstructor}: ReflectionMethodConstructorPayload) {
        this.visibility = visibility;
        this._isStatic = isStatic;
        this._isAbstract = isAbstract;
        this._isConstructor = isConstructor;
    }

    isAbstract(): boolean {
        return this._isAbstract;
    }

    isConstructor(): boolean {
        return this._isConstructor;
    }

    isPrivate(): boolean {
        return this.visibility === ReflexionMethodVisibility.PRIVATE;
    }

    isProtected(): boolean {
        return this.visibility === ReflexionMethodVisibility.PROTECTED;
    }

    isPublic(): boolean {
        return this.visibility === ReflexionMethodVisibility.PUBLIC;
    }

    isStatic(): boolean {
        return this._isStatic;
    }
}
