const moment = require("moment");
const { onDocumentCreated, log, db } = require("../firebase");

// Assuming the system user's UID is stored in an environment variable named SYSTEM_USER_UID
// const SYSTEM_USER_UID = process.env.SATOSHI_SUPPORT_UID;

exports.onNewTeamCreated = onDocumentCreated("/teams/{teamId}", async (event) => {
    const newTeamData = event.data.data();

    if (!newTeamData) {
        log("No team data found");
        return;
    }

    try {
        const subscriptionId = newTeamData.subscriptionId;
        const subRef = await db.collection("subscriptionTypes").doc(subscriptionId).get();
        const subscriptionType = subRef.data();
        db.collection("subscriptions")
            .doc(event.params.teamId)
            .set({
                team: {
                    id: event.params.teamId,
                    name: newTeamData.name,
                    ownerId: newTeamData.ownerId,
                    users: newTeamData.users,
                },
                status: "TRIALING",
                trialStartDate: moment().toDate(),
                trialEndDate: moment().add(subscriptionType.freeTrialPeriodDays, "days").toDate(),
                subscription: {
                    id: subscriptionId,
                    name: subscriptionType.name,
                    price: subscriptionType.price,
                },
                nextBillingDate: moment().add(subscriptionType.freeTrialPeriodDays, "days").toDate(),
                startDate: moment().add(subscriptionType.freeTrialPeriodDays, "days").toDate(),
                endDate: null,
                lastBillingDate: null,
                stripeSubscriptionId: "",
            });
    } catch (error) {
        log(`Failed to add subscription to the team: ${error}`);
    }
});
