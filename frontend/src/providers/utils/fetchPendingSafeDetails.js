import { getTransactionDetails } from "../../firebase";
import networks from "../../utils/networks.json";

const fetchPendingSafeDetails = async ({ safeTransactions }) => {
    try {
        const transactionDetailsPromises = safeTransactions.map(async (transaction) => {
            const targetChainID = networks[transaction.network].id;
            const response = await getTransactionDetails({
                chainId: targetChainID,
                txHash: transaction.satoshiData.transactionHash,
            });
            return response;
        });

        const transactionDetails = await Promise.all(transactionDetailsPromises);
        const safesToImport = [];
        const safesToTxHash = {};
        transactionDetails.forEach((response) => {
            // Do something based on the information returned in each response
            // For example:
            if (response && response.data && response.data.data && response.data.data.items) {
                const safeAddress = response.data.data.items[0].log_events[0].sender_address;
                safesToImport.push(safeAddress);
                safesToTxHash[response.data.data.items[0].tx_hash] = safeAddress;
            }
        });
        return { safesToImport, safesToTxHash };
    } catch (error) {
        console.error("Error getting pending safes:", error);
        throw error; // Or handle the error as appropriate for your application
    }
};

export default fetchPendingSafeDetails;
