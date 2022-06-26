import Manager from "../manager.model";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import HandlerInterface from "../../interfaces/handler.interface";
import {resolve} from 'path';
import CannotImportFileException from "./cannot-import-file.exception";

export default class ConfigLoaderManager extends Manager {
    public addHandler(handler: ConfigLoaderHandlerInterface, name: string) {
        super.addHandler(handler, name);

        this.subscribe(
            handler,
            CONFIG_LOADER_HANDLER_EVENTS.REQUIRE_CONFIGURATION_IMPORT,
            requirement => {
                 // do some extra check
                const importPath = resolve(requirement.dir, requirement.config.resource);
                try {
                    this.process({
                        path: importPath,
                        container: requirement.container
                    });
                } catch (error) {
                    if (
                        requirement.config?.ignore_errors !== true &&
                        !(requirement.config?.ignore_errors === 'not_found' && error.message.includes('does not exist.'))
                    ) {
                        throw new CannotImportFileException(importPath, requirement.path, 0);
                    }
                }
            }
        )
    }

    public retrieveDataForHandlers({ path }) {
        return path;
    }

    protected delegate(handler: HandlerInterface, params) {
        return handler.process(params);
    }
}
