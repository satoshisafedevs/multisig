const { onRequest, db, error } = require("../firebase");
const { configureCorsAndHandleOptions } = require("../utils/configureCorsAndHandleOptions");
const { validateFirebaseIdToken } = require("../utils/validateFirebaseIdToken");
const { deleteTransactionsOfSafeInTeam } = require("../utils/deleteTransactionsOfSafeInTeam");
const { checkDbForTxs } = require("../gnosis");

exports.transactions = onRequest(async (req, res) => {
    const responseSent = configureCorsAndHandleOptions(req, res);
    if (responseSent) return;
    const authorized = await validateFirebaseIdToken(req, res);
    if (!authorized) return;
    const uid = authorized.uid;

    if (req.method === "POST") {
        if ("teamid" in req.body) {
            const teamRef = db.doc(`teams/${req.body.teamid}`);
            try {
                const teamDoc = await teamRef.get();
                if (!teamDoc.exists) {
                    res.status(404).send({ message: "Team not found." });
                    return;
                }
                const teamData = teamDoc.data();
                // Check if user UID is in the team's users array
                if (!teamData.users.includes(uid)) {
                    res.status(403).send({ message: "User is not authorized to access this team." });
                    return;
                }
                if ("transactions" in req.body) {
                    // Check if transactions is an array and has at least one element
                    if (Array.isArray(req.body.transactions) && req.body.transactions.length > 0) {
                        try {
                            const dbStatus = await checkDbForTxs(req.body.transactions, req.body.teamid);
                            res.status(200).send({ status: "OK", fetchMore: dbStatus });
                            // fetch latest 10 transactions from gnosis
                            // if fetchMore is true
                            // fetch latest 100 transactions from gnosis
                        } catch (err) {
                            error(err);
                            res.status(500).send({ message: "Internal server error." });
                        }
                    } else {
                        res.status(400).send({ message: "Transactions should be a non-empty array." });
                    }
                } else {
                    res.status(400).send({ message: "Missing required transactions." });
                }
            } catch (err) {
                error(err);
                res.status(500).send({ message: "Error while checking user with team." });
            }
        } else {
            res.status(400).send({ message: "Missing required teamid." });
        }
    } else if (req.method === "DELETE") {
        const teamid = req.query.teamid;
        const safe = req.query.safe;

        if (teamid && safe) {
            const teamRef = db.doc(`teams/${teamid}`);
            try {
                const teamDoc = await teamRef.get();
                if (!teamDoc.exists) {
                    res.status(404).send({ message: "Team not found." });
                    return;
                }
                const teamData = teamDoc.data();
                // Check if user UID is in the team's users array
                if (!teamData.users.includes(uid)) {
                    res.status(403).send({ message: "User is not authorized to access this team." });
                    return;
                }
                try {
                    await deleteTransactionsOfSafeInTeam(teamid, safe);
                    res.status(200).send({ status: "OK", message: "Transactions deleted successfully." });
                } catch (err) {
                    error(err);
                    res.status(500).send({ message: "Error while deleting transactions." });
                }
            } catch (err) {
                error(err);
                res.status(500).send({ message: "Error while checking user with team." });
            }
        } else {
            res.status(400).send({ message: "Missing required query parameters." });
        }
    } else {
        res.status(400).send({ message: "Wrong request method." });
    }
});
