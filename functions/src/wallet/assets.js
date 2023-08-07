/* eslint-disable camelcase */
const { db } = require("../firebase");

const getAssetsByTeam = async (teamId) => {
    try {
        const teamSafesRef = await db.collection("teams").doc(teamId).get();
        const safes = teamSafesRef.data().safes;
        let assets = [];
        let stakedPortObject = [];
        let walletPortObject = [];
        if (!safes) {
            return [];
        }
        for (const { safeAddress } of safes) {
            // Build complex protocol list
            const complexProtocolListSnap = await db.collection("assetsByWalletAddress")
                .doc(safeAddress)
                .collection("complexProtocolList")
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();

            if (!complexProtocolListSnap.empty) {
                const doc = complexProtocolListSnap.docs[0];
                const complexProtocol = doc.data();
                // rest of your code here...
                if (complexProtocol && Array.isArray(complexProtocol.data)) {
                    complexProtocol.data.forEach(({ portfolio_item_list, name, chain }) => {
                        if (portfolio_item_list) {
                            portfolio_item_list.forEach((item) => {
                                const rewardTokenList = item.detail && item.detail.reward_token_list ?
                                    item.detail.reward_token_list.map(({ amount, name, chain }) => {
                                        return {
                                            amount,
                                            name,
                                            chain,
                                        };
                                    }) : [];
                                const supplyTokenList = item.detail && item.detail.supply_token_list ?
                                    item.detail.supply_token_list.map(({ amount, name, chain }) => {
                                        return {
                                            amount,
                                            name,
                                            chain,
                                        };
                                    }) : [];
                                stakedPortObject = [...stakedPortObject, { rewardTokens: rewardTokenList,
                                    suppliedTokens: supplyTokenList, name, chain }];
                            });
                        }
                    });
                }
            }

            // Build simple protocol list
            const simpleProtocolListSnap = await db.collection("assetsByWalletAddress")
                .doc(safeAddress)
                .collection("allTokenList")
                .orderBy("createdAt", "desc")
                .limit(1)
                .get();

            if (!simpleProtocolListSnap.empty) {
                const doc = simpleProtocolListSnap.docs[0];
                const simpleProtocol = doc.data();
                if (simpleProtocol && Array.isArray(simpleProtocol.data)) {
                    simpleProtocol.data.forEach(({ amount, name, chain }) => {
                        walletPortObject = [...walletPortObject, { amount, name, chain }];
                    });
                }
            }
            assets = [{ safeAddress, staked_assets: stakedPortObject, wallet_assets: walletPortObject }, ...assets];
        }
        return assets;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    getAssetsByTeam,
};
