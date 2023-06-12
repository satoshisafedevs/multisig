require("dotenv").config();
const { ethers, providers } = require("ethers");
const { EthersAdapter } = require("@safe-global/protocol-kit");
const networks = {
    "arbitrum": "arbitrum",
    "optimism": "optimism",
    "matic": "matic",
    "homestead": "homestead",
    "optimism-goerli": "optimism-goerli",
    "arbitrum-goerli": "arbitrum-goerli",
};

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
    if (networks[network] === undefined) {
        throw new Error("Invalid network");
    }
    return new providers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
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
