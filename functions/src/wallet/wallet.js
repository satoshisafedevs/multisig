const ethers = require("ethers");
let wallet = null;

async function generateWallet() {
    return ethers.Wallet.createRandom();
}

async function loadWallet(privateKey, provider) {
    wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

module.exports = {
    generateWallet,
    loadWallet,
    getWallet: () => wallet,
};
