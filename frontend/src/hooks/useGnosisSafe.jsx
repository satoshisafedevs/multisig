import SafeApiKit from "@safe-global/api-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import networks from "../safes/networks.json";

const useGnosisSafe = () => {
    const toast = useToast();

    const getSafeService = async (network) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const safeOwner = provider.getSigner(0);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            const txServiceUrl = networks[network].safeTransactionService;
            const safeService = new SafeApiKit({
                txServiceUrl,
                ethAdapter,
            });
            return safeService;
        } catch (error) {
            toast({
                description: `Failed to initialize Safe service: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getSafesByOwner = async (safeService, ownerAddress) => {
        try {
            const safes = await safeService.getSafesByOwner(ownerAddress);
            return safes;
        } catch (error) {
            toast({
                description: `Failed to get Safes by owner: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getSafeInfo = async (safeService, safeAddress) => {
        try {
            const safeInfo = await safeService.getSafeInfo(safeAddress);
            return safeInfo;
        } catch (error) {
            toast({
                description: `Failed to get Safe info: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getAllTransactions = async (safeService, safeAddress) => {
        try {
            const transactions = await safeService.getAllTransactions(safeAddress);
            return transactions;
        } catch (error) {
            toast({
                description: `Failed to get all Safe transactions: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
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
            toast({
                description: `Failed to create and approve transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return {
        getSafeService,
        getSafesByOwner,
        getSafeInfo,
        getAllTransactions,
        createAndApproveTransaction,
    };
};

export default useGnosisSafe;
