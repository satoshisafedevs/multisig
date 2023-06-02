require("dotenv").config();
const ethers = require("ethers");
const wallet = null;

// Define Alchemy provider for Optimism network
const optProvider =
    new ethers.AlchemyProvider("optimism", process.env.ALCHEMY_KEY);

async function getLatestBlock() {
    try {
        const blockNumber = await optProvider.getBlockNumber();
        const block = await optProvider.getBlock(blockNumber);
        return block;
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    getLatestBlock,
    wallet,
};
