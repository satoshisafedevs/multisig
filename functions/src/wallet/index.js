const { generateWallet, loadWallet, wallet, setupWallet } = require("./wallet");

const { getLatestBlock, getProvider, getEthersAdapter } = require("./ethers");

module.exports = {
    generateWallet,
    getLatestBlock,
    getProvider,
    loadWallet,
    wallet,
    getEthersAdapter,
    setupWallet,
};
