import Component from "../component.model";
import MixedInterface from "../mixed.interface";

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