const ethers = require("ethers");
let wallet = null;

async function generateWallet() {
    return ethers.Wallet.createRandom();
}

async function loadWallet(privateKey) {
    wallet = new ethers.Wallet(privateKey);
    return wallet;
}

module.exports = {
    generateWallet,
    loadWallet,
    wallet,
};
