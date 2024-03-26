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

    // try {
    //     // Check if the system user's UID is not already part of the users array
    //     if (!newTeamData.users.includes(SYSTEM_USER_UID)) {
    //         const teamRef = db.collection("teams").doc(event.params.teamId);
    //         await teamRef.update({
    //             // Add the system user's UID to the users array
    //             users: admin.firestore.FieldValue.arrayUnion(SYSTEM_USER_UID),
    //         });
    //         log("System user added to the team");
    //     } else {
    //         log("System user already part of the team");
    //     }
    // } catch (error) {
    //     log(`Failed to add system user to the team: ${error}`);
    // }

    try {
        const subscriptionId = newTeamData.subscriptionId;
        const subRef = await db.collection("subscriptionTypes").doc(subscriptionId).get();
        const subscriptionType = subRef.data();
        db.collection("subscriptions").add({
            teamId: event.params.teamId,
            trialStartDate: moment().toDate(),
            trialStartEnd: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
            subscription: {
                id: subscriptionId,
                price: subscriptionType.price,
                nextBillingDate: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
                startDate: moment().add(FREE_TRIAL_PERIOD_DAYS, "days").toDate(),
                endDate: null,
                lastBillingDate: null,
            },
        });
    } catch (error) {
        log(`Failed to add subscription to the team: ${error}`);
    }
});
