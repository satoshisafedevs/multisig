import type { Timestamp } from "../functions/src/firebase"

export interface Subscription{
    team: {
        id: string,
        ownerId: string,
        name: string
    }
    subscription: {
        id: string,
        name: string,
        price: number
    }
    status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED"
    trialStartDate: Timestamp
    trialEndDate: Timestamp
    lastBillingDate: Timestamp
    nextBillingDate: Timestamp
    startDate: Timestamp
    endDate: Timestamp 
    stripeSubscriptionId: string
}