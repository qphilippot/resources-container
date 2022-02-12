import {describe, it} from 'mocha';
import {expect} from 'chai';
import ParameterBag from "../../../src/core/parameter-bag/parameter-bag.model";
import ParameterNotFoundException from "../../../src/core/exception/parameter-not-found.exception";
import RuntimeException from "../../../src/core/exception/runtime.exception";
import ParameterCircularReferenceException from "../../../src/core/exception/parameter-circular-reference.exception";
import ReadOnlyParameterBag from "../../../src/core/parameter-bag/read-only.parameter-bag";
import LogicException from "../../../src/core/exception/logic.exception";

const someParameters = {
    foo: 'foo',
    bar: 'bar'
};

describe('Read-Only-Bag', function () {
    it('construct() takes an array of parameters as its first argument', function() {
        const bag = new ReadOnlyParameterBag({...someParameters});
        expect(JSON.stringify(bag.all(), null, 4)).to.equals(JSON.stringify(someParameters, null, 4));
    });

    it('throws an error trying to clear ', () => {
        const bag = new ReadOnlyParameterBag({});
        expect(bag.clear.bind(bag)).to.throw(
            LogicException,
            'Impossible to call clear() on  a read-only ParameterBag.'
        );
    });

    it('throws an error trying to set value ', () => {
        const bag = new ReadOnlyParameterBag({});
        expect(bag.set.bind(bag, ['foo', 'bar'])).to.throw(
            LogicException,
            'Impossible to call set() on  a read-only ParameterBag.'
        );
    });

    it('throws an error trying to add value ', () => {
        const bag = new ReadOnlyParameterBag({});
        expect(bag.add.bind(bag, [])).to.throw(
            LogicException,
            'Impossible to call add() on  a read-only ParameterBag.'
        );
    });

    it('throws an error trying to remove value ', () => {
        const bag = new ReadOnlyParameterBag({});
        expect(bag.remove.bind(bag, [])).to.throw(
            LogicException,
            'Impossible to call remove() on  a read-only ParameterBag.'
        );
    });
});
