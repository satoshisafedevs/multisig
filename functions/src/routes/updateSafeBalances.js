const { onCall, HttpsError } = require("../firebase");
const { getAllBalances } = require("../debank");

exports.updateSafeBalances = onCall(async (req) => {
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { safes, teamName, teamId } = req.data;
    try {
        await getAllBalances(safes, teamName, teamId);
    } catch (error) {
        throw new HttpsError("unknown", error.message);
    }
});
