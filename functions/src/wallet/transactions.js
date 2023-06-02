const ethers = require("ethers");
const { wallet } = require("./ethers");

async function buildTransaction(contractAddress, abi, functionName, params) {
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // create the transaction data
    const transactionRequest = await contract.populateTransaction[functionName](...params);

    // sign the transaction
    const signedTransaction = await wallet.signTransaction(transactionRequest);

    return signedTransaction;
}

module.exports = {
    buildTransaction,
};


