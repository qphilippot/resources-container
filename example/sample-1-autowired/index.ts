import Launcher from "./launcher";
import {resolve} from "path";

const launcher = new Launcher(resolve(__dirname, './src'));
launcher.setup().then(() => {
    launcher.loadDefinitions(resolve(__dirname, './services.yaml'));
    launcher.start();
});
