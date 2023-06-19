const ethers = require("ethers");
const { getProvider, getEthersAdapter } = require("./ethers");
const { getSafeService } = require("../gnosis");

async function generateWallet() {
    return ethers.Wallet.createRandom();
}

async function loadWallet(privateKey, provider) {
    try {
        if (privateKey === undefined) {
            throw new Error("Invalid private key");
        }
        return new ethers.Wallet(privateKey, provider);
    } catch (error) {
        console.error("Failed to load the wallet", error);
        throw error;
    }
}

async function setupWallet(network, privateKey) {
    try {
        const provider = await getProvider(network);
        const wallet = await loadWallet(privateKey, provider);
        const ethAdapter = await getEthersAdapter(wallet);
        const safeService = await getSafeService(network, ethAdapter);
        return { provider, wallet, ethAdapter, safeService };
    } catch (error) {
        console.error("Failed to setup the wallet", error);
        throw error;
    }
}

module.exports = {
    generateWallet,
    loadWallet,
    setupWallet,
};
