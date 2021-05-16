import ContainerBuilder from "./core/container-builder.model";
import HelloService from "./services/hello.service";
import ReflexionService from "./utils/reflexion.service";
import AutowirableContainerService from "./autowirable-container.service";
import TrevorService from "./services/trevor.service";
import Component from "./core/models/component/component.model";
//
const containerService : ContainerBuilder = new ContainerBuilder();
//
//
containerService.addResource(new HelloService(), 'service.hello');
containerService.addResource(
    new HelloService({
        id: 'service.hello_2'
    })
);
//
containerService.recordResource('aa.bb.cc', HelloService, { id: 'elephant' });
containerService.addAlias('hello', 'service.hello');

// const reflector = new ReflexionService();
// console.log(reflector.getFunctionArgumentsName(function(a, b, c){}));
// console.log(reflector.getFunctionArgumentsName(function(a: string = "a", b: number = 0, c: any = null){}));
// console.log(reflector.getFunctionArgumentsName(function({ a: string = "a", b: number = 0, c: any = null}){}));
// console.log(Reflect.getMetadata('design:paramtypes', function({ a: string = "a", b: number = 0, c: any = null}){}));
// const autowirableContainerService = new AutowirableContainerService();

// new TrevorService(...[undefined, undefined]);

containerService.addDefinition('service.trevor', TrevorService, {
    dependencies: {
        'helloService': 'service.hell0'
    }
});

containerService.process();

console.log("end --", containerService.getContainer().resources);

// const component = new Component({ id: 'hello-component' });
// component.addMethod('sayHello', function () { console.log(`hello from ${this.name}`)} );
// component.sayHello();

// const publisher = new Component({ name: 'publisher-component' });
// const subscriber = new Component({ name: 'subscriber-component' });
//
// subscriber.subscribe(publisher, 'hello', function (data) { console.log(subscriber.name, 'hello', data)} );
//
// publisher.publish('hello', 'world');
// publisher.publish('hello', 'world');
// publisher.publish('hello', 'world');
//
// subscriber.unsubscribe({ notification: 'hello' });
//
//
// publisher.publish('hello', 'world');
