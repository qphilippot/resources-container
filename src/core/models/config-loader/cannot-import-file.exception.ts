export default class CannotImportFileException extends Error {
    /**
     * @param resource       The resource that could not be imported
     * @param sourceResource The original resource importing the new resource
     * @param code           The error code
     * @param previous       A previous exception
     * @param type           The type of resource
     */
    constructor(
        resource: string,
        sourceResource: string | null = null,
        code: number = 0,
        previous?: Error,
        type?: string
    ) {
        let message = '';

        if (previous instanceof Error) {
            // Include the previous exception, to help the user see what might be the underlying cause
            // Trim the trailing period of the previous message.
            const str = previous.message;
            const prefix = str.endsWith('.') ? str.substring(0, str.length - 1) : str;
            message = `${prefix} in ${resource} `;

            // show tweaked trace to complete the human readable sentence
            if (sourceResource === null) {
                message += `(which is loaded in resource "${resource}")`;
            } else {
                message += `(which is being imported from "${sourceResource}")`;
            }

            message += '.';
            // if there's no previous message, present it the default way
        } else if (sourceResource) {
            message += `Cannot import "${resource}" from "${sourceResource}".`;
        } else {

            message += `Cannot load resource "${resource}".`;
        }

        // // Is the resource located inside a bundle?
        //         if ('@' === $resource[0]) {
        //             $parts = explode(\DIRECTORY_SEPARATOR, $resource);
        //             $bundle = substr($parts[0], 1);
        //             $message .= sprintf(' Make sure the "%s" bundle is correctly registered and loaded in the application kernel class.', $bundle);
        //             $message .= sprintf(' If the bundle is registered, make sure the bundle path "%s" is not empty.', $resource);
        //         } elseif (null !== $type) {
        //             // maybe there is no loader for this specific type
        //             if ('annotation' === $type) {
        //                 $message .= ' Make sure to use PHP 8+ or that annotations are installed and enabled.';
        //             } else {
        //                 $message .= sprintf(' Make sure there is a loader supporting the "%s" type.', $type);
        //             }
        //         }
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}
