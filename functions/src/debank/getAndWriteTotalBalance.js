const { log, db, Timestamp } = require("../firebase");

exports.getAndWriteTotalBalance = async (safe, options) => {
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
