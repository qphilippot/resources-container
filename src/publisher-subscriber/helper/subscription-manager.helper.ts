import SubscriptionManagerInterface from "../interfaces/subscription-manager.interface";

export function findSubscriptionByRoleAndComponentId(
    subscriptionManager: SubscriptionManagerInterface,
    role: string,
    componentId: string
) {
    if (role !== ROLE.PUBLISHER_ID && role !== ROLE.SUBSCRIBER_ID) {
        throw new InvalidArgumentException(
            `Invalid argument given for "role" in "findSubscriptionByRoleAndComponentId". Values expected are "publisher_id" or "subscriber_id" but "${role}" was given.`
        );
    }

    return subscriptionManager.getSubscriptions().filter(subscription => {
        return subscription[role] === componentId;
    });
}

import InvalidArgumentException from "../../core/exception/invalid-argument.exception";

export const ROLE = {
    PUBLISHER_ID: 'publisher_id',
    SUBSCRIBER_ID: 'subscriber_id',
}