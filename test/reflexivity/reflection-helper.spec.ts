import {describe, it} from 'mocha';
import {buildInheritanceTreeFromClassMetadataCollection} from "../../src/reflection/reflection.helper";
import {expect} from "chai";


const meta = {
    'App/Foo': {
        superClass: null,
        implements: [],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Foo1': {
        superClass: {name: 'Foo', namespace: 'App/Foo'},
        implements: [],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Foo2': {
        superClass: {name: 'Foo', namespace: 'App/Foo'},
        implements: [],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Foo3': {
        superClass: {name: 'Foo', namespace: 'App/Foo'},
        implements: [{ name: 'SomeInterface', namespace: 'App/SomeInterface' }],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Bar': {
        superClass: {name: 'Foo3', namespace: 'App/Foo3'},
        implements: [],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Bar2': {
        superClass: {name: 'Bar', namespace: 'App/Bar'},
        implements: [{name: 'SaperlipopetteInterface', namespace: 'App/SaperlipopetteInterface'}],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/SuperCoolInterface': {
        superClass: null,
        implements: [{name: 'SaperlipopetteInterface', namespace: 'App/SaperlipopetteInterface'}],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
    'App/Lascar': {
        superClass: null,
        implements: [{name: 'SuperCoolInterface', namespace: 'App/SuperCoolInterface'}],
        namespace: '',
        name: '',
        abstract: true,
        constructor: [],
        methods: {},
        imports: [],
        export: {
            path: '',
            type: ''
        }
    },
}
describe('Reflection Helper test', () => {
    it('resolve inheritance graph', () => {

        const inheritanceTree = buildInheritanceTreeFromClassMetadataCollection(meta);

        expect(inheritanceTree.extendsClass['App/Foo1']).to.include('App/Foo');
        expect(inheritanceTree.extendsClass['App/Foo2']).to.include('App/Foo');
        expect(inheritanceTree.extendsClass['App/Foo'].length).to.equals(0);


        expect(inheritanceTree.implementsInterface['App/Foo1'].length).to.equals(0);
        expect(inheritanceTree.implementsInterface['App/Foo2'].length).to.equals(0);
        expect(inheritanceTree.implementsInterface['App/Foo'].length).to.equals(0);

        expect(inheritanceTree.implementsInterface['App/Foo3'].length).to.equals(1);
        expect(inheritanceTree.implementsInterface['App/Foo3']).to.include('App/SomeInterface');
        expect(inheritanceTree.extendsClass['App/Foo3']).to.include('App/Foo');


        expect(inheritanceTree.implementsInterface['App/Bar'].length).to.equals(1);
        expect(inheritanceTree.implementsInterface['App/Bar']).to.include('App/SomeInterface');

        expect(inheritanceTree.extendsClass['App/Bar'].length).to.equals(2);
        expect(inheritanceTree.extendsClass['App/Bar']).to.include('App/Foo');
        expect(inheritanceTree.extendsClass['App/Bar']).to.include('App/Foo3');


        expect(inheritanceTree.implementsInterface['App/Bar2'].length).to.equals(2);
        expect(inheritanceTree.implementsInterface['App/Bar2']).to.include('App/SomeInterface');
        expect(inheritanceTree.implementsInterface['App/Bar2']).to.include('App/SaperlipopetteInterface');
        expect(inheritanceTree.extendsClass['App/Bar2'].length).to.equals(3);
        expect(inheritanceTree.extendsClass['App/Bar2']).to.include('App/Foo');
        expect(inheritanceTree.extendsClass['App/Bar2']).to.include('App/Foo3');
        expect(inheritanceTree.extendsClass['App/Bar2']).to.include('App/Bar');

        expect(inheritanceTree.implementsInterface['App/Lascar'].length).to.equals(2);
        expect(inheritanceTree.implementsInterface['App/Lascar']).to.include('App/SuperCoolInterface');
        expect(inheritanceTree.implementsInterface['App/Lascar']).to.include('App/SaperlipopetteInterface');
        expect(inheritanceTree.extendsClass['App/Lascar'].length).to.equals(0);
    });
});
