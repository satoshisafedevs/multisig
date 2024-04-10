const { onCall, HttpsError } = require("../firebase");

exports.getWalletTokenBalances = onCall(async (req, res) => {
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { chainId, safeAddress } = req.data;
    if (chainId && safeAddress) {
        try {
            const response = await fetch(
                `https://api.covalenthq.com/v1/${chainId}/address/${safeAddress}/balances_v2/`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.COVALENTHQ_KEY}`,
                    },
                },
            );
            const data = await response.json();
            return data;
        } catch (e) {
            throw new HttpsError("internal", e.message);
        }
    } else throw new HttpsError("aborted", "Missing required query params.");
});
