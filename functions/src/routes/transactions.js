const { onRequest } = require("../firebase");
const { configureCorsAndHandleOptions } = require("../utils/configureCorsAndHandleOptions");
const { validateFirebaseIdToken } = require("../utils/validateFirebaseIdToken");
const { checkDbForTxs } = require("../gnosis");

exports.transactions = onRequest(async (req, res) => {
    const responseSent = configureCorsAndHandleOptions(req, res);
    if (responseSent) return;
    const authorized = await validateFirebaseIdToken(req, res);
    if (!authorized) return;
    if (req.method === "POST") {
        if ("transactions" in req.body && "teamid" in req.body) {
            // Check if transactions is an array and has at least one element
            if (Array.isArray(req.body.transactions) && req.body.transactions.length > 0) {
                try {
                    const dbStatus = await checkDbForTxs(req.body.transactions, req.body.teamid);
                    res.status(200).send({ status: "OK", fetchMore: dbStatus });
                    // fetch latest 10 transactions from gnosis
                    // if fetchMore is true
                    // fetch latest 100 transactions from gnosis
                } catch (error) {
                    console.error(error);
                    res.status(500).send({ message: "Internal server error." });
                }
            } else {
                // Send an error if transactions is not an array or is empty
                res.status(400).send({ message: "Transactions should be a non-empty array." });
            }
        } else {
            res.status(400).send({ message: "Missing transactions body." });
        }
    } else {
        res.status(400).send({ message: "Wrong request method." });
    }
});
