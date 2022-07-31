import Launcher from "./launcher";
import {resolve} from "path";

const launcher = new Launcher(resolve(__dirname, './src'));
launcher.loadDefinitions(resolve(__dirname, './services.yaml'));
launcher.start();
