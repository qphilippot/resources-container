import { describe, it } from 'mocha';
import { expect } from  'chai';
import PublisherSubscriber from "../../model/publisher-subscriber.model";
import YamlLoader from "../../../../file-loader/yaml-loader";
import ObjectSubscriptions from './subscriptions/say-hello-subscription';
import { subscribeFromObject } from '../../helper/subscriber.helper';

// const loader = new YamlLoader();
// const content = loader.process(resolve(__dirname, './subscriptions/say-hello-subscription.yaml'));



class Prompter extends PublisherSubscriber {
    private counter = 0;
    prompt({ a, b }) {
        this.counter++;
    }

    getCounter(): number {
        return this.counter;
    }
}

describe('Can subscribe from standard object', () => {
    it('a', () => {
        let publisher = new PublisherSubscriber({ name: 'publisher' });
        let subscriber = new Prompter({ name: 'subscriber' });

        subscribeFromObject(subscriber, publisher, ObjectSubscriptions.handler);

        publisher.publish('say-hello', {
            param1: { a: 'abc'},
            param2: 'def'
        });

        expect(subscriber.getCounter()).to.be.equals(1);
    })
});