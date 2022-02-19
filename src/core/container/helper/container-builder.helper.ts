import ContainerBuilder from "../container-builder.model";

export const getEnvCounter = (container: ContainerBuilder): string[] => {
    const envPlaceholders = container.getEnvPlaceholders();
    return Array.from(new Set(envPlaceholders.keys()));
};
