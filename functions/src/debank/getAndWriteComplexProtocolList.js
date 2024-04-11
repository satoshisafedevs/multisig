const { log, db, Timestamp } = require("../firebase");
const networks = require("../networks");

exports.getAndWriteComplexProtocolList = async (safe, options) => {
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
