// dumped import (from C:\Users\Quentin\resources-container\src\core\dumper\TsDumperService.ts)
import Resource_AppsrcHandlerA from "./src/HandlerA";
import Resource_AppsrcHandlerB from "./src/HandlerB";
import Resource_AppsrcMainClass from "./src/MainClass";


// dumped instantiation
const instance_AppsrcHandlerA = new Resource_AppsrcHandlerA();
const instance_AppsrcHandlerB = new Resource_AppsrcHandlerB();
const instance_AppsrcMainClass = new Resource_AppsrcMainClass(instance_AppsrcHandlerA, instance_AppsrcHandlerB);


// dumped exports
export const AppsrcHandlerA = instance_AppsrcHandlerA;
export const AppsrcHandlerB = instance_AppsrcHandlerB;
export const AppsrcMainClass = instance_AppsrcMainClass;
export const main = instance_AppsrcMainClass;
