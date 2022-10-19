import MixedInterface from "../../utils/mixed.interface";
import ContainerBuilder from "./container-builder.model";
import ResolveReferencesToAliasesPass from "../compilation-passes/standard/resolve-references-to-aliases.pass";
import {BEFORE_OPTIMIZATION, OPTIMIZATION} from "../compiler-step.enum";
import ResolveClassPass from "../compilation-passes/standard/resolve-class.pass";

class DefaultContainer extends ContainerBuilder {

    constructor(settings: MixedInterface = {}) {
      super(settings);

      const compiler = this.getCompiler();
      compiler.addPass(new ResolveClassPass(), BEFORE_OPTIMIZATION);
      compiler.addPass(new ResolveReferencesToAliasesPass(), OPTIMIZATION);
    }
}

export default DefaultContainer;
