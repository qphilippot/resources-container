"use strict";
exports.__esModule = true;
var container_service_1 = require("./container.service");
var hello_service_1 = require("./services/hello.service");
var component_model_1 = require("./core/models/component/component.model");
var containerService = new container_service_1["default"]();
containerService.addResource(new hello_service_1["default"](), 'service.hello');
containerService.addResource(new hello_service_1["default"]({
    id: 'service.hello_2'
}));
containerService.recordResource('aa.bb.cc', hello_service_1["default"], { id: 'elephant' });
containerService.addAlias('hello', 'service.hello');
// const reflector = new ReflexionService();
//
// console.log(reflector.getFunctionArgumentsName(function(a, b, c){}));
// console.log(reflector.getFunctionArgumentsName(function(a: string = "a", b: number = 0, c: any = null){}));
// console.log(reflector.getFunctionArgumentsName(function({ a: string = "a", b: number = 0, c: any = null}){}));
// const autowirableContainerService = new AutowirableContainerService();
// containerService.addDefinition('service.trevor', TrevorService);
// containerService.process();
var component = new component_model_1["default"]({ id: 'hello-component' });
component.addMethod('sayHello', function () { console.log("hello from " + this.name); });
component.sayHello();
