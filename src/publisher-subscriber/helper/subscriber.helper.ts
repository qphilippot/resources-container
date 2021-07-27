import FlexibleService from "../../utils/flexible.service";
const flexible = new FlexibleService();

interface SubscriptionObjectEntryInterface {
    notification: string
    action: string,
    mapAttributes?: Record<string, any>
}

export function subscribeFromObject(subscriber, publisher, subscriptions) {
    Object.values(subscriptions).forEach((subscription: SubscriptionObjectEntryInterface) => {
        // console.log('subscription', subscription)
        const callback = subscriber[subscription.action].bind(subscriber);
        subscriber.subscribe(
            publisher,
            subscription.notification,
            data => {
                let parameters = {};
                if (typeof subscription.mapAttributes !== 'undefined') {
                    const mappage =  subscription.mapAttributes;
                    console.log(mappage);
                    Object.keys(mappage).forEach(attributeName => {
                        const propertyToRetrieve: string = mappage[attributeName] ?? '';
                        parameters[attributeName] = flexible.get(
                            propertyToRetrieve,
                            data
                        );

                        console.log( attributeName,  parameters[attributeName]);
                    });


                    callback(parameters);
                }

                else {
                    callback(data);
                }
            }

        )
    });
}