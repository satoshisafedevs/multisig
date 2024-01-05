const { onRequest } = require("../firebase");
const { configureCrossOriginAccess } = require("../utils/configureCrossOriginAccess");
const { validateFirebaseIdToken } = require("../utils/validateFirebaseIdToken");

exports.getWalletTokenBalances = onRequest(async (req, res) => {
    const responseSent = configureCrossOriginAccess(req, res);
    if (responseSent) return;
    if (req.method === "GET") {
        if (validateFirebaseIdToken(req, res)) {
            const chainId = req.query.chainId;
            const safeAddress = req.query.safeAddress;
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
                    res.status(200).send(data);
                    return;
                } catch (e) {
                    res.status(400).send({ message: e.message });
                    return;
                }
            } else res.status(400).send({ message: "Missing required query params." });
        }
    } else {
        res.status(400).send({ message: "Wrong request method." });
    }
});
