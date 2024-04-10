const { onCall, db, error, HttpsError } = require("../firebase");
const { deleteTransactionsOfSafeInTeam } = require("../utils/deleteTransactionsOfSafeInTeam");
const { checkDbForTxs } = require("../gnosis");

exports.transactions = onCall(async (req, res) => {
    // Security check to ensure the request is from an authenticated user.
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const uid = req.auth.uid;
    const { transactions, teamid, safe, method } = req.data;
    // No need for CORS configuration as onCall functions handle CORS automatically.

    // Ensure the UID is received (already available in context.auth.uid).
    // Proceed with your logic as required, for example:

    if (method === "POST") {
        if (teamid) {
            const teamRef = db.doc(`teams/${teamid}`);
            try {
                const teamDoc = await teamRef.get();
                if (!teamDoc.exists) {
                    throw new HttpsError("not-found", "Team not found.");
                }
                const teamData = teamDoc.data();
                if (!teamData.users.includes(uid)) {
                    throw new HttpsError("permission-denied", "User is not authorized to access this team.");
                }
                if (transactions) {
                    if (Array.isArray(transactions) && transactions.length > 0) {
                        try {
                            const dbStatus = await checkDbForTxs(transactions, teamid);
                            return { fetchMore: dbStatus };
                        } catch (err) {
                            error(err);
                            throw new HttpsError("internal", "Internal server error.");
                        }
                    } else {
                        throw new HttpsError("invalid-argument", "Transactions should be a non-empty array.");
                    }
                } else {
                    throw new HttpsError("invalid-argument", "Missing required transactions.");
                }
            } catch (err) {
                error(err);
                throw new HttpsError("internal", "Error while checking user with team.");
            }
        } else {
            throw new HttpsError("invalid-argument", "Missing required teamid.");
        }
    } else if (method === "DELETE") {
        if (teamid && safe) {
            const teamRef = db.doc(`teams/${teamid}`);
            try {
                const teamDoc = await teamRef.get();
                if (!teamDoc.exists) {
                    throw new HttpsError("not-found", "Team not found.");
                }
                const teamData = teamDoc.data();
                if (!teamData.users.includes(uid)) {
                    throw new HttpsError("permission-denied", "User is not authorized to access this team.");
                }
                try {
                    await deleteTransactionsOfSafeInTeam(teamid, safe);
                    return "Transactions deleted successfully.";
                } catch (err) {
                    error(err);
                    throw new HttpsError("internal", "Error while deleting transactions.");
                }
            } catch (err) {
                error(err);
                throw new HttpsError("internal", "Error while checking user with team.");
            }
        } else {
            throw new HttpsError("invalid-argument", "Missing required query parameters.");
        }
    } else {
        throw new HttpsError("invalid-argument", "Wrong request method.");
    }
});
