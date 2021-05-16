import Component from "../models/component/component.model";

class Feature {
    protected isFeatureEnabled: boolean = false;

    bind(component: Component, settings: any = {}) {}

    initialize() {}

    enable() {
        this.isFeatureEnabled = true;
    }

    isEnabled() : boolean {
        return this.isFeatureEnabled === true;
    }

    disable() {
        this.isFeatureEnabled = false;
    }


    toggle() {
        if (this.isEnabled()) {
            this.disable();
        }

        else {
            this.enable();
        }
    }
}

export default Feature;