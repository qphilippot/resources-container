import Component from "../core/models/component/component.model";
import MixedInterface from "../utils/mixed.interface";
import HelloService from "./hello.service";

class TrevorService extends Component {
    protected readonly helloService: HelloService;

    constructor(
        helloService: HelloService,
        settings: MixedInterface = {}
    ) {
        super({
            ...settings,
            name: settings.name || 'trevor-service'
        });

        this.helloService = helloService;
    }

    public sayHello() {
        console.log('hello');
    }
}

export default TrevorService;
