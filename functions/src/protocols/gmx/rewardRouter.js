const { Contract } = require("ethers");
const rewardRouter = require("./RewardRouter.json");
const networks = require("../../networks");

// Claim rewards
function claim(network, params, wallet) {
    const gmxAddress = networks[network].contracts.gmxRewardRouter;
    const tokenContract = new Contract(gmxAddress, rewardRouter, wallet);
    const value = 0;
    const data = tokenContract.interface.encodeFunctionData("handleRewards", params);
    return { to: gmxAddress, value, data };
}

// Stake GMX
function stakeGMX(network, amount, wallet) {
    const gmxAddress = networks[network].contracts.gmxRewardRouter;
    const tokenContract = new Contract(gmxAddress, rewardRouter, wallet);
    const value = 0;
    const data = tokenContract.interface.encodeFunctionData("stakeGmx", [amount]);
    return { to: gmxAddress, value, data };
}

// Stake GMX
function unStakeGMX(network, amount, wallet) {
    const gmxAddress = networks[network].contracts.gmxRewardRouter;
    const tokenContract = new Contract(gmxAddress, rewardRouter, wallet);
    const value = 0;
    const data = tokenContract.interface.encodeFunctionData("unstakeGmx", [amount]);
    return { to: gmxAddress, value, data };
}

module.exports = {
    claim,
    stakeGMX,
    unStakeGMX,
};
