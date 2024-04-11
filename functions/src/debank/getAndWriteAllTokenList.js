const { log, db, Timestamp } = require("../firebase");

exports.getAndWriteAllTokenList = async (safe, options) => {
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
