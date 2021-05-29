import PSRContainerInterface from  '../../../psr/container/container.interface';

export default interface ContainerInterface extends PSRContainerInterface {
    hasParameter(name: string): boolean;
    getParameter(name: string): any;
};
