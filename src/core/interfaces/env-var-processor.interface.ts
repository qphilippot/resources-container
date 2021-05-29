import EnvVarProcessorManagerInterface from "./env-var-processor-manager.interface";

export default interface EnvVarProcessorInterface
{
    process(prefix: string, name: string, getEnv: Function, manager: EnvVarProcessorManagerInterface);
    match(prefix: string): boolean;
    getProcessedTypeName(): string;
}
