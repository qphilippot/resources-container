import Component from "../core/models/component/component.model";
import MixedInterface from "../utils/mixed.interface";

class RexService extends Component {
    // eslint-disable-next-line
    constructor({ service_hello }: MixedInterface, settings: MixedInterface = {}) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }

    public sayHello() {
        console.log('hello');
    }
}

export default RexService;
