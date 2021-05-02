import Component from "../core/models/component/component.model";
import MixedInterface from "../core/mixed.interface";
import HelloService from "./hello.service";

class TrevorService extends Component {
    helloService: HelloService;

    constructor(
        helloService: HelloService,
        settings: MixedInterface = {}
    ) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });

        this.helloService = helloService;
    }

    sayHello() {
        console.log('hello');
    }
}

export default TrevorService;