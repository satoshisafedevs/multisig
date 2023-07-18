const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { onSchedule, log, db, Timestamp } = require("../firebase");

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
            for (const teamDoc of teamsRef.docs) {
                const teamData = teamDoc.data();
                for (const safe of teamData.safes || []) {
                    if (safe.safeAddress) {
                        const url = `https://pro-openapi.debank.com/v1/user/total_balance?id=${safe.safeAddress}`;
                        const options = {
                            method: "GET",
                            headers: {
                                Accept: "application/json",
                                AccessKey: ACCESS_KEY,
                            },
                        };
                        const response = await fetch(url, options);
                        const balance = await response.json();
                        const balancesRef = db
                            .collection("assetsByWalletAddress")
                            .doc(safe.safeAddress)
                            .collection("totalBalances");
                        await balancesRef.add({
                            createdAt: Timestamp.now(),
                            ...balance,
                        });
                    }
                }
            }
        } catch (error) {
            log("Error getting balance:", error);
        }
        log("Finished getting daily balances.");
    },
);
