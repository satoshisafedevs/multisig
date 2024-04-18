const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { log, db } = require("../firebase");
const { getAndWriteTotalBalance } = require("./getAndWriteTotalBalance");
const { getAndWriteComplexProtocolList } = require("./getAndWriteComplexProtocolList");
const { getAndWriteAllTokenList } = require("./getAndWriteAllTokenList");

exports.getAllBalances = async (safes, teamName, teamId) => {
    log(`Updating ${safes?.length} safe(s) balances for team: ${teamName}, ${teamId}`);
    try {
        let ACCESS_KEY;
        if (process.env.FUNCTIONS_EMULATOR === "true") {
            // For local development, directly use the API key from an environment variable or local config file
            ACCESS_KEY = process.env.DEBANK_API_TOKEN;
        } else {
            // For production, continue to use Secret Manager
            const client = new SecretManagerServiceClient();
            const [version] = await client.accessSecretVersion({
                name: `projects/${
                    JSON.parse(process.env.FIREBASE_CONFIG).projectId
                }/secrets/DEBANK_API_TOKEN/versions/latest`,
            });
            ACCESS_KEY = version.payload.data.toString();
        }
        const processedSafes = new Set(); // This will hold the safe addresses we've processed
        for (const safe of safes || []) {
            if (safe.safeAddress && !processedSafes.has(safe.safeAddress)) {
                const safeDocRef = db.collection("assetsByWalletAddress").doc(safe.safeAddress);
                const safeDoc = await safeDocRef.get();
                if (!safeDoc.exists) {
                    // let's create doc for safe if it does not exist,
                    // otherwise firestore errors in UI console:
                    // This document does not exist, it will not appear in queries or snapshots.
                    await safeDocRef.set({});
                }
                // If this safe hasn't been processed yet...
                // ...add it to the set of processed safes
                processedSafes.add(safe.safeAddress);

                const options = {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        AccessKey: ACCESS_KEY,
                    },
                };
                try {
                    await getAndWriteTotalBalance(safe, options);
                } catch (error) {
                    log(`Error getting total balance for ${safe.safeAddress}, ${safe.network}:`, error);
                }

                try {
                    // complex protocol list - stacked assets
                    await getAndWriteComplexProtocolList(safe, options);
                } catch (error) {
                    log(`Error getting complex protocol list for ${safe.safeAddress}, ${safe.network}:`, error);
                }

                try {
                    // all token list - wallet assets
                    await getAndWriteAllTokenList(safe, options);
                } catch (error) {
                    log(`Error getting all token list for ${safe.safeAddress}, ${safe.network}:`, error);
                }
            }
        }
    } catch (error) {
        log("Error getting balance:", error);
    }
    log("Finished updating team safe(s) balances.");
};
