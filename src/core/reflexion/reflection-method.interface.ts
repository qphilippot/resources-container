export default interface ReflectionMethodInterface {
    isPublic(): boolean;
    isProtected(): boolean;
    isPrivate(): boolean;

    isAbstract(): boolean;
    isConstructor(): boolean;
    isStatic(): boolean;
}
