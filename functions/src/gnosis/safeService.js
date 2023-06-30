const ApiKit = require("@safe-global/api-kit");
const networks = require("../networks");

const getSafeService = async (network, ethAdapter) => {
    try {
        const SafeApiKit = ApiKit.default;
        const txServiceUrl = networks[network].safeTransactionService;
        const safeService = new SafeApiKit({
            txServiceUrl,
            ethAdapter,
        });
        return safeService;
    } catch (error) {
        console.error("Failed to initialize Safe service", error);
        throw error;
    }
};

const getSafesByOwner = async (safeService, ownerAddress) => {
    try {
        const safes = await safeService.getSafesByOwner(ownerAddress);
        return safes;
    } catch (error) {
        console.error("Failed to get Safes by owner", error);
        throw error;
    }
};

const getSafeInfo = async (safeService, safeAddress) => {
    try {
        const safeInfo = await safeService.getSafeInfo(safeAddress);
        return safeInfo;
    } catch (error) {
        console.error("Failed to get Safe info", error);
        throw error;
    }
};

const getAllTransactions = async (safeService, safeAddress) => {
    try {
        const transactions = await safeService.getAllTransactions(safeAddress);
        return transactions;
    } catch (error) {
        console.error("Failed to get all transactions", error);
        throw error;
    }
};

const createAndApproveTransaction = async (safe, safeService, safeAddress, tx, wallet) => {
    try {
        const safeTx = await safe.createTransaction({
            safeTransactionData: tx,
        });
        const txhash = await safe.getTransactionHash(safeTx);
        const signature = await safe.signTransactionHash(txhash);
        safeTx.addSignature(signature);
        await safeService.proposeTransaction({
            safeAddress,
            senderAddress: wallet.address,
            safeTransactionData: safeTx.data,
            safeTxHash: txhash,
            senderSignature: signature.data,
        });
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    getSafeService,
    getSafesByOwner,
    getSafeInfo,
    getAllTransactions,
    createAndApproveTransaction,
};
