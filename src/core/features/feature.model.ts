class Feature {
    protected isFeatureEnabled: boolean = false;


    public enable() {
        this.isFeatureEnabled = true;
    }

    public isEnabled() : boolean {
        return this.isFeatureEnabled === true;
    }

    public disable() {
        this.isFeatureEnabled = false;
    }


    public toggle() {
        if (this.isEnabled()) {
            this.disable();
        }

        else {
            this.enable();
        }
    }
}

export default Feature;
