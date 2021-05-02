import MixedInterface from "./core/mixed.interface";
import ContainerService from "./container.service";

// todo: return an error instead of null when a component is not found

class AutowirableContainerService extends ContainerService {
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