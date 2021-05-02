import Component from "../core/models/component/component.model";
import MixedInterface from "../core/mixed.interface";

class RexService extends Component {
    constructor({ service_hello }: MixedInterface, settings: MixedInterface = {}) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }

    sayHello() {
        console.log('hello');
    }
}

export default RexService;