const moment = require("moment");
const { onDocumentCreated, log, db } = require("../firebase");

// Assuming the system user's UID is stored in an environment variable named SYSTEM_USER_UID
// const SYSTEM_USER_UID = process.env.SATOSHI_SUPPORT_UID;
const FREE_TRIAL_PERIOD_DAYS = 7;

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

        db.collection("subscriptions").add({
            team: {
                id: event.params.teamId,
                name: newTeamData.name,
                ownerId: newTeamData.ownerId,
            },
            trialStartDate: moment().toDate(),
            trialEndDate: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
            subscription: {
                id: subscriptionId,
                name: subscriptionType.name,
                price: subscriptionType.price,
            },
            nextBillingDate: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
            startDate: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
            endDate: null,
            lastBillingDate: null,
        });
    } catch (error) {
        log(`Failed to add subscription to the team: ${error}`);
    }
});
