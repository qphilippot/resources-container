import ReflectionParameterInterface from "./reflection-parameter.interface";

export default interface ReflectionMethodInterface {
    isPublic(): boolean;
    isProtected(): boolean;
    isPrivate(): boolean;

    isAbstract(): boolean;
    isConstructor(): boolean;
    isStatic(): boolean;

    getParameters(): ReflectionParameterInterface[];
    getParameter(name: string): ReflectionParameterInterface;
}
