import {describe, it} from 'mocha';
import {expect} from 'chai';
import testCaseA from './fixtures/a';
import { generateClassesMetadata } from "../../../src/generate-classes-metadata";

describe('Testing generateClassesMetadata function with real files', () => {
    it(' A - standard use-case works', () => {
        const response = generateClassesMetadata({ ...testCaseA.options });
        const responseString = JSON.stringify(response, null, 4);
        expect(responseString.length).to.be.greaterThan(0);
        expect(responseString).to.equals(JSON.stringify(testCaseA.result, null, 4));
    });
});
