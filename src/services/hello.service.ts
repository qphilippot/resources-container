import Component from "../core/component.model";
import MixedInterface from "../core/mixed.interface";

class HelloService extends Component {
    constructor(settings: MixedInterface = {}) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }

    sayHello() {
        console.log('hello');
    }
}

export default HelloService;