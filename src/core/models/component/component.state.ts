import MixedInterface from "../../../utils/mixed.interface";


class ComponentState {
    private state: MixedInterface = {};

    public store(key: string, value: any) {
        this.state[key] = value;
    }

    public get(key: string): any {
        return this.state[key];
    }
}

export default ComponentState;
