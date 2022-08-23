export default interface ReflectionParameterInterface {
    getName(): string;
    getPosition(): number;
    // getType(): ?ReflectionType
    // hasType(): boolean;
    // isArray(): boolean;
    // isCallable(): boolean;
    isDefaultValueAvailable(): boolean;
    // isDefaultValueConstant(): boolean;
    // isOptional(): boolean;
    // isVariadic(): boolean;
}
