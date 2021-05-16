"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_service_1 = require("./container.service");
const hello_service_1 = require("./services/hello.service");
const trevor_service_1 = require("./services/trevor.service");
//
const containerService = new container_service_1.default();
//
//
containerService.addResource(new hello_service_1.default(), 'service.hello');
containerService.addResource(new hello_service_1.default({
    id: 'service.hello_2'
}));
//
containerService.recordResource('aa.bb.cc', hello_service_1.default, { id: 'elephant' });
containerService.addAlias('hello', 'service.hello');
// const reflector = new ReflexionService();
// console.log(reflector.getFunctionArgumentsName(function(a, b, c){}));
// console.log(reflector.getFunctionArgumentsName(function(a: string = "a", b: number = 0, c: any = null){}));
// console.log(reflector.getFunctionArgumentsName(function({ a: string = "a", b: number = 0, c: any = null}){}));
// console.log(Reflect.getMetadata('design:paramtypes', function({ a: string = "a", b: number = 0, c: any = null}){}));
// const autowirableContainerService = new AutowirableContainerService();
// new TrevorService(...[undefined, undefined]);
containerService.addDefinition('service.trevor', trevor_service_1.default, {
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
//# sourceMappingURL=index.js.map