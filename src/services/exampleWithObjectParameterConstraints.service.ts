import Component from "../component.model";
import MixedInterface from "../mixed.interface";

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