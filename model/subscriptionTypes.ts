import type { Timestamp } from "../functions/src/firebase"

interface Feature{
    description: string
    name: string
}
export interface SubscriptionType{
    description: string
    features: Feature[]
    name: string
    price: number
    stripePriceId: string
    billingType: string // for exmaple. "month per team"
    freeTrialPeriodDays: number
}