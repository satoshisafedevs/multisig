const { onCall, HttpsError, onRequest, db, Timestamp } = require("../firebase");
const moment = require("moment");

const ENV_DOMAIN = "https://playground.satoshisafe.ai";

const getTeamIdByStripeSessionId = async (id) => {
    const checkoutSessionRef = db.collection("stripeSubscriptions").doc(id);
    const checkoutSessionDoc = await checkoutSessionRef.get();

    if (!checkoutSessionDoc.exists) {
        console.log("No related checkout session found in Firestore.");
        return;
    }

    const checkoutSessionData = checkoutSessionDoc.data();
    const { teamId, userId } = checkoutSessionData; // Assuming you stored userId at checkout
    return { teamId, userId };
};

const updateFirestoreSubscription = async (teamId, updateData) => {
    const subscriptionQuerySnapshot = await db.collection("subscriptions").doc(teamId).get();

    if (subscriptionQuerySnapshot.exists) {
        await db
            .collection("subscriptions")
            .doc(teamId)
            .update({ ...updateData, updatedAt: Timestamp.now() });
        console.log(`Subscription ${teamId} updated with `, updateData);
    } else {
        console.log(`No Subscription document found for Stripe Team ID: ${teamId}`);
    }
};

const updateInvoice = async (teamId, ownerId, invoiceData) => {
    await db
        .collection("invoices")
        .doc(invoiceData.id)
        .set(
            {
                stripeInvoiceId: invoiceData.id, // Stripe's Invoice ID
                amountPaid: invoiceData.amount_paid,
                currency: invoiceData.currency,
                customer: invoiceData.customer,
                invoiceUrl: invoiceData.hosted_invoice_url,
                paidAt: Timestamp.fromDate(
                    moment(invoiceData.created * 1000).toDate(),
                ), // Convert Stripe's timestamp to Firestore Timestamp
                status: invoiceData.status, // Typically "paid" for this event handler
                billingReason: invoiceData.billing_reason, // Why this invoice was created (e.g., "subscription_create")
                customerEmail: invoiceData.customer_email,
                customerName: invoiceData.customer_name,
                teamId,
                ownerId,
                createdAt: Timestamp.now(),
            },
            { merge: true },
        );
};

exports.getPaymentLink = onCall(
    {
        secrets: ["STRIPE_ACCOUNT_KEY"],
    },
    async (req, res) => {
        if (!req.auth) {
            throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
        }

        const stripe = require("stripe")(process.env.STRIPE_ACCOUNT_KEY);

        const prices = await stripe.prices.list({
            lookup_keys: [req.data.lookupKey],
            expand: ["data.product"],
        });
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: prices.data[0].id,
                    quantity: 1,
                },
            ],
            automatic_tax: {
                enabled: true,
            },
            billing_address_collection: "required",
            mode: "subscription",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${ENV_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${ENV_DOMAIN}?canceled=true`,
        });

        await db.collection("stripeSubscriptions").doc(session.id).set({
            userId: req.auth.uid,
            stripeLookupKey: req.data.lookupKey,
            stripeSessionId: session.id,
            stripeSessionUrl: session.url,
            teamId: req.data.teamId,
            createdAt: Timestamp.now(),
        });

        return session.url;
    },
);

exports.stripeWebhook = onRequest(
    {
        secrets: ["STRIPE_ENDPOINT_SECRET", "STRIPE_ACCOUNT_KEY"],
    },
    async (req, res) => {
        const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
        const stripe = require("stripe")(process.env.STRIPE_ACCOUNT_KEY);
        const sig = req.headers["stripe-signature"];

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            const session = event.data.object;
            switch (event.type) {
            case "checkout.session.completed":
                if (session.mode === "subscription" && session.subscription) {
                    const stripeSubscriptionId = session.subscription;
                    const sessionId = session.id;
                    // Use session.subscription to find the corresponding Firestore document
                    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                    const startDate = Timestamp.fromMillis(subscription.current_period_start * 1000);
                    const endDate = Timestamp.fromMillis(subscription.current_period_end * 1000);
                    const { teamId, userId } = await getTeamIdByStripeSessionId(sessionId);
                    await updateFirestoreSubscription(teamId, {
                        stripeSubscriptionId: stripeSubscriptionId,
                        status: "ACTIVE", // Set initial status, adjust as needed
                        nextBillingDate: endDate,
                        lastBillingDate: startDate,
                        endDate: endDate,
                    });

                    // Check if the subscription has a latest invoice
                    if (subscription.latest_invoice) {
                        // Retrieve the invoice object using the latest_invoice ID
                        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

                        // Extract the hosted invoice URL from the invoice object
                        await updateInvoice(teamId, userId, invoice);
                    }
                }
                break; // This break corresponds to the if statement inside "checkout.session.completed"
            case "invoice.paid":
                // Make sure session and session.subscription are defined and valid
                if (session && session.subscription) {
                    const stripeSubscriptionId = session.subscription;
                    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                    const { teamId, userId } = await getTeamIdByStripeSessionId(stripeSubscriptionId);
                    // Retrieve subscription to find next billing date, if applicable
                    const nextBillingTimestamp = subscription.current_period_end;
                    await updateFirestoreSubscription(session.subscription, {
                        status: "ACTIVE",
                        nextBillingDate: Timestamp.fromDate(
                            new Date(nextBillingTimestamp * 1000),
                        ), // Convert to Firestore Timestamp
                        lastBillingDate: Timestamp.now(),
                        endDate: Timestamp.fromDate(new Date(nextBillingTimestamp * 1000)),
                    });
                    await updateInvoice(teamId, userId, session);
                }
                break;
            case "invoice.payment_failed":
                // Make sure session and session.subscription are defined and valid
                if (session && session.subscription) {
                    await updateFirestoreSubscription(session.subscription, { status: "past_due" });
                }
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error(`Error processing webhook: ${error}`);
            res.status(500).send(`Internal Server Error: ${error}`);
        }
    },
);
