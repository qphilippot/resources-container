/**
 * Adapt the PSR-11 Container interface
 */

import ContainerExceptionInterface from "./container-exception.interface";

/**
 * No entry was found in the container.
 */

type NotFoundExceptionInterface = ContainerExceptionInterface

export default NotFoundExceptionInterface;
