const { Timestamp } = require("@google-cloud/firestore");
const { HttpsError, onCall, db } = require("../firebase");
const moment = require("moment");

exports.selectSubscriptionForTeam = onCall(async (req, res) => {
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const { teamId, subscriptionId } = req.data;

    if (!teamId || !subscriptionId) {
        throw new HttpsError("invalid-argument", "Team ID and Subscription ID must be provided.");
    }

    const teamRef = await db.collection("teams").doc(teamId).get();
    if (!teamRef.exists) {
        throw new HttpsError("invalid-argument", "Team with this ID doesn't exist.");
    }
    const team = teamRef.data();

    if (team.ownerId !== req.auth.uid) {
        throw new HttpsError("permission-denied", "The caller is not owner of the team.");
    }

    const subscriptionTypeRef = await db.collection("subscriptionTypes").doc(subscriptionId).get();
    if (!subscriptionTypeRef.exists) {
        throw new HttpsError("invalid-argument", "Subscription Type with this ID doesn't exist.");
    }
    const subscriptionType = subscriptionTypeRef.data();

    const subscriptionsRef = db.collection("subscriptions");
    const teamSubscriptions = await subscriptionsRef
        .where("team.id", "==", teamId)
        .get();

    if (!teamSubscriptions.empty) {
        // Team already has an active or potentially recoverable subscription
        throw new HttpsError(
            "already-exists",
            "This team already has an active or pending subscription.",
        );
    }

    await db
        .collection("subscriptions")
        .doc(teamId)
        .set({
            team: {
                id: teamId,
                name: team.name,
                ownerId: team.ownerId,
            },
            status: "TRIALING",
            trialStartDate: Timestamp.now(),
            trialEndDate: Timestamp.fromDate(
                moment()
                    .add(subscriptionType.freeTrialPeriodDays, "days")
                    .toDate(),
            ),
            subscription: {
                id: subscriptionId,
                name: subscriptionType.name,
                price: subscriptionType.price,
            },
            nextBillingDate: Timestamp.fromDate(
                moment()
                    .add(subscriptionType.freeTrialPeriodDays, "days")
                    .toDate(),
            ),
            startDate: Timestamp.fromDate(
                moment()
                    .add(subscriptionType.freeTrialPeriodDays, "days")
                    .toDate(),
            ),
            endDate: null,
            lastBillingDate: null,
            stripeSubscriptionId: "",
        });
});
