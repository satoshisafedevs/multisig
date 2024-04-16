const moment = require("moment");
const { log, db, onDocumentUpdated } = require("../firebase");

exports.onTeamEdited = onDocumentUpdated("/teams/{teamId}", async (event) => {
    const updatedData = event.data.after.data();
    try {
        const subRef = await db.collection("subscriptions").where("team.id", "==", event.params.teamId).get();
        for (const sub of subRef.docs) {
            await db
                .collection("subscriptions")
                .doc(sub.id)
                .set(
                    {
                        team: {
                            name: updatedData.name,
                            ownerId: updatedData.ownerId,
                            users: updatedData.users,
                        },
                        updatedAt: moment().toDate(),
                    },
                    { merge: true },
                );
        }
    } catch (error) {
        log(`Failed to add subscription to the team: ${error}`);
    }
});
