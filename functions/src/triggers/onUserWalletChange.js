const { onDocumentWritten, log, db } = require("../firebase");
const { utils } = require("ethers");
const { getSafesByOwner, getSafeService } = require("../gnosis");
const { getEthersAdapter, getProvider } = require("../wallet");
const networks = require("../networks");

exports.onUserWalletChange = onDocumentWritten(
    "/users/{uid}/teams/{teamId}",
    async (event) => {
        const newDocumentData = event.data.after.data();

        if (!newDocumentData) {
            log("No document found");
            return;
        }

        const walletAddress = newDocumentData.userWalletAddress;

        if (walletAddress === undefined) {
            log("No userWalletAddress found in the new document");
            return;
        }

        const oldDocumentData = event.data.before.data();
        const oldWalletAddress = oldDocumentData ? oldDocumentData.userWalletAddress : undefined;

        if (walletAddress === oldWalletAddress) {
            log("No wallet change");
            return;
        }
        if (utils.isAddress(walletAddress)) {
            try {
                const allSafes = [];
                for (const key in networks) {
                    if (networks[key].safeTransactionService === undefined) {
                        continue;
                    }
                    const provider = await getProvider(key);
                    const ethAdapter = await getEthersAdapter(provider);
                    const safeService = await getSafeService(key, ethAdapter);
                    const safeReturn = await getSafesByOwner(safeService, walletAddress);
                    safeReturn.safes.forEach((safe) => {
                        allSafes.push({
                            network: key,
                            safeAddress: safe,
                        });
                    });
                }
                const safesRef = db.collection("users").doc(event.params.uid)
                    .collection("teams").doc(event.params.teamId);
                await safesRef.set({ safes: allSafes }, { merge: true });
                // Merge is true to not overwrite other fields
                return;
            } catch (error) {
                log("Failed to fetch all safes", error);
            }
        } else {
            log("Invalid wallet address");
        }
        return;
    });

