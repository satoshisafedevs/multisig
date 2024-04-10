const moment = require("moment");
const lodash = require("lodash");
const { log, db, onDocumentUpdated } = require("../firebase");

exports.onSubscriptionTypeEdited = onDocumentUpdated("/subscriptionTypes/{subscriptionTypeId}", async (event) => {
    const updatedData = event.data.after.data();
    try {
        const subscriptionsToUpdate = await db.collection("subscriptions")
            .where("subscription.id", "==", event.params.subscriptionTypeId).get();
        const chunks = lodash.chunk(subscriptionsToUpdate.docs, 500);
        for (const chunkObj of chunks) {
            const batch = db.batch();
            for (const a of chunkObj) {
                batch.set(db.collection("subscriptions").doc(a.id),
                    {
                        subscription: {
                            name: updatedData.name,
                            price: updatedData.price,
                        },
                        updatedAt: moment().toDate(),
                    },
                    { merge: true },
                );
            }
            await batch.commit();
        }
    } catch (error) {
        log(`Failed to add subscription to the team: ${error}`);
    }
});
