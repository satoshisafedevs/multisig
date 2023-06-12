const { generateWallet, loadWallet, wallet } = require("./wallet");

const { getLatestBlock, getProvider, getEthersAdapter } = require("./ethers");

module.exports = {
    generateWallet,
    getLatestBlock,
    getProvider,
    loadWallet,
    wallet,
    getEthersAdapter,
};
