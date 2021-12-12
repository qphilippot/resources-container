import MixedInterface from "./utils/mixed.interface";
import ContainerBuilder from "./core/container/container-builder.model";

// todo: return an error instead of null when a component is not found

class AutowirableContainerService extends ContainerBuilder {
    isAutowireEnabled: boolean;

    constructor(settings: MixedInterface = {}) {
        super(settings);

        if (
            typeof settings.isAutowireEnabled !== 'undefined' &&
            settings.isAutowireEnabled !== true
        ) {
            this.disableAutoriwing();
        }

        else {
            this.enableAutowiring();
        }
    }

    enableAutowiring() {
        this.isAutowireEnabled = true;
    }

    disableAutoriwing() {
        this.isAutowireEnabled = false;
    }
}

export default AutowirableContainerService;
