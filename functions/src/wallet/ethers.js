require("dotenv").config();
const { ethers, providers } = require("ethers");
const { EthersAdapter } = require("@safe-global/protocol-kit");
const networks = require("../networks");

async function getLatestBlock(provider) {
    try {
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);
        return block;
    } catch (error) {
        console.error(error);
    }
}

async function getProvider(network) {
    try {
        if (networks[network] === undefined) {
            throw new Error("Invalid network");
        }
        return new providers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
    } catch (error) {
        console.error(error);
        throw new Error("Invalid network");
    }
}

async function getEthersAdapter(wallet) {
    try {
        const ethersAdapter = new EthersAdapter({ ethers, signerOrProvider: wallet });
        return ethersAdapter;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getLatestBlock,
    getProvider,
    getEthersAdapter,
};
