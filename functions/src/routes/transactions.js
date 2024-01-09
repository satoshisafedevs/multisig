const { onRequest } = require("../firebase");
const { configureCrossOriginAccess } = require("../utils/configureCrossOriginAccess");
const { validateFirebaseIdToken } = require("../utils/validateFirebaseIdToken");

exports.transactions = onRequest(async (req, res) => {
    const responseSent = configureCrossOriginAccess(req, res);
    if (responseSent) return;
    if (req.method === "POST") {
        if (validateFirebaseIdToken(req, res)) {
            if (req.body.transactions) {
                // Check if transactions is an array and has at least one element
                if (Array.isArray(req.body.transactions) && req.body.transactions.length > 0) {
                    res.status(200).send({ status: "ok" });
                } else {
                    // Send an error if transactions is not an array or is empty
                    res.status(400).send({ message: "Transactions should be a non-empty array" });
                }
            } else {
                res.status(400).send({ message: "Missing transactions body" });
            }
        }
    } else {
        res.status(400).send({ message: "Wrong request method." });
    }
});
