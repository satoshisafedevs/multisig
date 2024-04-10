const { error, db } = require("../firebase");

const validateIfSubscriptionIsActive = async (req, res) => {
    const { teamId } = req.body;
    if (!teamId) {
        error("Team ID is not provided");
        res.status(403).send({ message: "Unauthorized" });
        return false;
    }

    const subscriptionQuerySnapshot = await db.collection("subscriptions").doc(teamId).get();

    if (subscriptionQuerySnapshot.exists) {
        const doc = subscriptionQuerySnapshot.data;
        if (doc.status === "ACTIVE" || doc.status === "TRIALING") {
            return true;
        }
    } else {
        error(`Subscription for team ID: ${teamId} is not found`);
        res.status(403).send({ message: "Unauthorized" });
        return false;
    }
};

module.exports = { validateIfSubscriptionIsActive };
