const { Contract, utils } = require("ethers");
const uniswapV3Abi = require("./UniswapRouterV3.json");
const erc20Abi = require("../erc20.json");
const networks = require("../../networks");

// Approve transaction
function approve(network, tokenAddress, amount, wallet) {
    const uniswapAddress = networks[network].contracts.uniswapv3;
    const tokenContract = new Contract(tokenAddress, erc20Abi, wallet);
    const value = 0;
    const data = tokenContract.interface.encodeFunctionData("approve", [uniswapAddress, amount]);
    return { to: tokenAddress, value, data };
}

function swap(
    network, safeAddress, wallet, tokenInContractAddress, tokenOutContractAddress,
    tokenInDecimal, tokenAmountIn,
) {
    if (!utils.isAddress(safeAddress)) {
        throw new Error("Invalid safeAddress");
    }

    if (!utils.isAddress(tokenInContractAddress)) {
        throw new Error("Invalid tokenInContractAddress");
    }

    if (!utils.isAddress(tokenOutContractAddress)) {
        throw new Error("Invalid tokenOutContractAddress");
    }

    const uniswapAddress = networks[network]?.contracts?.uniswapv3;

    if (!utils.isAddress(uniswapAddress)) {
        throw new Error("Invalid uniswapAddress");
    }

    const uniswapContract = new Contract(uniswapAddress, uniswapV3Abi, wallet);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const amountIn = utils.parseUnits(tokenAmountIn, tokenInDecimal);
    const amountOutMin = 0; // Specify your minimum output amount here.

    const params = {
        tokenIn: tokenInContractAddress,
        tokenOut: tokenOutContractAddress,
        fee: 3000, // Replace with the correct fee tier: 500, 3000, or 10000
        recipient: safeAddress,
        deadline: deadline,
        amountIn: amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0, // Replace with the price you want your trade to execute at or set as 0 to ignore
    };

    const data = uniswapContract.interface.encodeFunctionData("exactInputSingle", [params]);

    return { to: uniswapAddress, value: 0, data };
}

module.exports = {
    approve,
    swap,
};
