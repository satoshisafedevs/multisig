const { onCall, HttpsError } = require("../firebase");

exports.getTransactionDetails = onCall(async (req) => {
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const { chainId, txHash } = req.data;
    if (chainId && txHash) {
        try {
            const response = await fetch(`https://api.covalenthq.com/v1/${chainId}/transaction_v2/${txHash}/`, {
                headers: {
                    Authorization: `Bearer ${process.env.COVALENTHQ_KEY}`,
                },
            });
            const data = await response.json();
            return data;
        } catch (e) {
            throw new HttpsError("internal", e.message);
        }
    } else throw new HttpsError("aborted", "Missing required query params.");
});
