import Component from "../core/models/component/component.model";
import MixedInterface from "../utils/mixed.interface";

class RexService extends Component {
    // eslint-disable-next-line
    constructor({ service_hello }: MixedInterface, settings: MixedInterface = { a: 10 }) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }

    public sayHello(name: string) {
        console.log(`hello ${name}`);
    }
}

export default RexService;
