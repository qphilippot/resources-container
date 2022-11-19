// dumped import (from C:\Users\Quentin\resources-container\example\sample-1\launcher.ts)
import resource_AppsrcHandlerA from "./src/HandlerA";
import resource_AppsrcHandlerB from "./src/HandlerB";
import resource_AppsrcMainClass from "./src/MainClass";


// dumped instantiation
const instance_AppsrcHandlerA = new resource_AppsrcHandlerA();
const instance_AppsrcHandlerB = new resource_AppsrcHandlerB();
const instance_AppsrcMainClass = new resource_AppsrcMainClass(instance_AppsrcHandlerA, instance_AppsrcHandlerB);


// dumped exports
export const AppsrcHandlerA = instance_AppsrcHandlerA;
export const AppsrcHandlerB = instance_AppsrcHandlerB;
export const AppsrcMainClass = instance_AppsrcMainClass;
export const main = instance_AppsrcMainClass;
