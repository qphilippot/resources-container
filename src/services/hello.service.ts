import Component from "../core/models/component/component.model";
import MixedInterface from "../utils/mixed.interface";

class HelloService extends Component {
    constructor(settings: MixedInterface = {}) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }

    public sayHello() {
        console.log('hello');
    }
}

export default HelloService;
