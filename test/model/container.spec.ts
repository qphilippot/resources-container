import {describe, it} from 'mocha';
import {expect} from 'chai';
import Container from "../../src/core/container/container.model";
import ParameterBag from "../../src/core/parameter-bag/parameter-bag.model";
import ReadOnlyParameterBag from "../../src/core/parameter-bag/read-only.parameter-bag";


describe('Container', () => {
    it('automatically registers itself as a service', function (){
        const container = new Container();
        expect(container.get('service.container')).to.equals(container);
    });
    it('accept a parameter bag as constructor first argument property', function (){
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        expect(JSON.stringify(container.getParameterBag().all())).to.equals('{"foo":"bar"}');
    });

    it('resolves the parameter bag on compile', function () {
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        expect(container.getParameterBag().isResolved()).to.be.false;
        container.compile();
        expect(container.getParameterBag().isResolved()).to.be.true;
        expect(container.getParameterBag()).to.be.instanceof(ReadOnlyParameterBag);
        expect(JSON.stringify(container.getParameterBag().all())).to.equals('{"foo":"bar"}');
    })
});
