const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { onSchedule, log, db, Timestamp } = require("../firebase");
const networks = require("../networks");

const getAndWriteTotalBalance = async (safe, options) => {
    log(`Getting total balance for ${safe.safeAddress}`);
    const url = `https://pro-openapi.debank.com/v1/user/total_balance?id=${safe.safeAddress}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const docRef = db.collection("assetsByWalletAddress").doc(safe.safeAddress).collection("totalBalance");
    await docRef.add({
        createdAt: Timestamp.now(),
        ...data,
    });
};

const getAndWriteComplexProtocolList = async (safe, options) => {
    log(`Getting complex protocol list for ${safe.safeAddress}`);
    const url = `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${safe.safeAddress}&chain_id=${
        networks[safe.network].deBankChainID
    }`;
    const response = await fetch(url, options);
    const data = await response.json();
    const docRef = db.collection("assetsByWalletAddress").doc(safe.safeAddress).collection("complexProtocolList");
    await docRef.add({
        createdAt: Timestamp.now(),
        data,
    });
};

const getAndWriteAllTokenList = async (safe, options) => {
    log(`Getting all token list for ${safe.safeAddress}`);
    const url = `https://pro-openapi.debank.com/v1/user/all_token_list?id=${safe.safeAddress}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const docRef = db.collection("assetsByWalletAddress").doc(safe.safeAddress).collection("allTokenList");
    await docRef.add({
        createdAt: Timestamp.now(),
        data,
    });
};

exports.getDailyBalances = onSchedule(
    { schedule: "every day 00:01", timeZone: "America/Los_Angeles" },
    async (event) => {
        log("I get balances every midnight!");
        try {
            const client = new SecretManagerServiceClient();
            const [version] = await client.accessSecretVersion({
                name: `projects/${
                    JSON.parse(process.env.FIREBASE_CONFIG).projectId
                }/secrets/DEBANK_API_TOKEN/versions/latest`,
            });
            const ACCESS_KEY = version.payload.data.toString();
            const teamsRef = await db.collection("teams").get();
            const processedSafes = new Set(); // This will hold the safe addresses we've processed
            for (const teamDoc of teamsRef.docs) {
                const teamData = teamDoc.data();
                for (const safe of teamData.safes || []) {
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
                        await getAndWriteTotalBalance(safe, options);

                        // complex protocol list - stacked assets
                        await getAndWriteComplexProtocolList(safe, options);

                        // all token list - wallet assets
                        await getAndWriteAllTokenList(safe, options);
                    }
                }
            }
        } catch (error) {
            log("Error getting balance:", error);
        }
        log("Finished getting daily balances.");
    },
);
