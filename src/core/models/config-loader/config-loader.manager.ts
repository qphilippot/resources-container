import Manager from "../manager.model";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import FileLoaderNotFoundException from "../../exception/file-loader-not-found.exception";
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import HandlerInterface from "../../interfaces/handler.interface";

export default class ConfigLoaderManager extends Manager {
    public addHandler(handler: ConfigLoaderHandlerInterface, name: string) {
        super.addHandler(handler, name);

        this.subscribe(
            handler,
            CONFIG_LOADER_HANDLER_EVENTS.REQUIRE_CONFIGURATION_IMPORT,
            requirement => {
                // do some extra check
                this.process({
                    path: requirement.entry.path,
                    container: requirement.container
                });
            }
        )
    }

    protected delegate(handler: HandlerInterface, params) {
        return handler.process(params);
    }
};