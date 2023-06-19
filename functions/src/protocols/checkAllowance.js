const { Contract } = require("ethers");
const erc20Abi = require("../ERC20.json");

async function checkAllowance(tokenAddress, ownerAddress, spenderAddress, signer) {
    const tokenContract = new Contract(tokenAddress, erc20Abi, signer);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    // Remember to adjust the amount for token decimals if necessary
    return allowance;
}

module.exports = {
    checkAllowance,
};
