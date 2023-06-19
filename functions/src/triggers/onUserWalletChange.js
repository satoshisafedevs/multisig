const { onDocumentWritten, log } = require("../firebase");
const { utils } = require("ethers");
const { getSafesByOwner, getSafeService } = require("../gnosis");
const { getEthersAdapter, getProvider } = require("../wallet");
const networks = require("../networks");

exports.onUserWalletChange = onDocumentWritten(
    "/users/{uid}/teams/{teamId}/userWalletAddress",
    async (event) => {
        const document = event.data.after.data();
        if (document === undefined) {
            log("No document found");
            return;
        }
        if (utils.isAddress(document)) {
            let allSafes = [];
            for (const key in networks) {
                if (networks[key].safeTransactionService === undefined) {
                    continue;
                }
                const provider = await getProvider(key);
                const ethAdapter = await getEthersAdapter(provider);
                const safeService = await getSafeService(key, ethAdapter);
                const safes = await getSafesByOwner(safeService, document);
                allSafes = allSafes.concat(safes);
                return;
            }
        } else {
            log("Invalid address");
        }
    });

