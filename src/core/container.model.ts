import Mixed from "./mixed.interface";
import Component from "./models/component/component.model";

class Container extends Component {
    resources: Mixed;
    aliases: Record<string, string>;
    parameters: Mixed;

    constructor(settings: Mixed = {}) {
        super(settings);

        this.resources = {};
        this.aliases = {};
        this.parameters = {};
    }
}

export default Container;