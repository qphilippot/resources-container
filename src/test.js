function hello() {
    console.log('hello');
}

class A {}
class B extends A {
    constructor(param1 = new A()) {
        super();
    }
}