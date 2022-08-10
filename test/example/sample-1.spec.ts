import {describe, it} from 'mocha';
import {expect} from 'chai';
import {resolve} from "path";
import Launcher from "../../example/sample-1/launcher";
import AutowiredLauncher from "../../example/sample-1-autowired/launcher";
import MainClass from "../../example/sample-1/src/MainClass";
import AutowiredMainClass from "../../example/sample-1-autowired/src/MainClass";
import RuntimeException from "../../src/core/exception/runtime.exception";
import ContainerBuilder from "../../src/core/container/container-builder.model";

describe('Sample-1 works as expected', () => {
    it('Start launcher', function () {
        const basePath = resolve(__dirname, '../../example/sample-1');
        const launcher = new Launcher(resolve(basePath, './src'));
        launcher.loadDefinitions(resolve(basePath, './services.yaml'));
        launcher.start(true);

        const container = launcher.getContainer();

        // compilation of public definition with two parameters
        const mainClass = container.get('App/src/MainClass');

        expect(mainClass).to.be.instanceof(MainClass);
        expect(mainClass.hello()).to.be.equals('hello i am MainClass & hello from HandlerA & hello from HandlerB');


        // private definition are not accessible from container.get
        expect(container.get.bind(container, 'App/src/HandlerA')).to.throws(
            RuntimeException,
            'Unable to get the following service "App/src/HandlerA" after compilation because it is private.'
        );
    });

    it('Start launcher - autowiring variation', function () {
        const basePath = resolve(__dirname, '../../example/sample-1-autowired');
        const launcher = new AutowiredLauncher(resolve(basePath, './src'));
        launcher.loadDefinitions(resolve(basePath, './services.yaml'));
        launcher.start(true);

        const container = launcher.getContainer() as ContainerBuilder;

        // compilation of public definition with two parameters
        expect(container.hasDefinition('App/src/MainClass')).to.be.true;
        expect(container.hasDefinition('App/src/HandlerA')).to.be.true;
        expect(container.hasDefinition('App/src/HandlerB')).to.be.true;
        const mainClass = container.get('App/src/MainClass');

        expect(mainClass).to.be.instanceof(AutowiredMainClass);
        expect(mainClass.hello()).to.be.equals('hello i am MainClass & hello from HandlerA & hello from HandlerB');


        // todo autowired public as default ?
        // private definition are not accessible from container.get
        // expect(container.get.bind(container, 'App/src/HandlerA')).to.throws(
        //     RuntimeException,
        //     'Unable to get the following service "App/src/HandlerA" after compilation because it is private.'
        // );
    });
});
