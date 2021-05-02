import ContainerService from "./container.service";
import HelloService from "./services/hello.service";
import ReflexionService from "./core/reflexion.service";
import AutowirableContainerService from "./autowirable-container.service";
import TrevorService from "./services/trevor.service";
const containerService : ContainerService = new ContainerService();

containerService.addResource(new HelloService(), 'service.hello');
containerService.addResource(
    new HelloService({
        id: 'service.hello_2'
    })
);

containerService.recordResource('aa.bb.cc', HelloService, { id: 'elephant' });
containerService.addAlias('hello', 'service.hello');

// const reflector = new ReflexionService();
//
// console.log(reflector.getFunctionArgumentsName(function(a, b, c){}));
// console.log(reflector.getFunctionArgumentsName(function(a: string = "a", b: number = 0, c: any = null){}));
// console.log(reflector.getFunctionArgumentsName(function({ a: string = "a", b: number = 0, c: any = null}){}));

// const autowirableContainerService = new AutowirableContainerService();


containerService.addDefinition('service.trevor', TrevorService);
containerService.process();