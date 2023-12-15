import SafeApiKit from "@safe-global/api-kit";
import Safe, { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import networks from "../utils/networks.json";
import checkNetwork from "../utils/checkNetwork";
import { db, doc, setDoc } from "../firebase";
import { useUser } from "../providers/User";
import { useTransactions } from "../providers/Transactions";

const useGnosisSafe = () => {
    const { getLatestGnosisData } = useTransactions();
    const toast = useToast();
    const { user, currentTeam, getUserTeamsData } = useUser();

    const getSafeSdk = async (safeAddress) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const safeOwner = provider.getSigner(0);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            const safeSdk = await Safe.create({ ethAdapter, safeAddress });
            return safeSdk;
        } catch (error) {
            toast({
                description: `Failed to initialize Safe SDK: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

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

    const getAllTransactions = async (safeService, safeAddress, allTxsOptions) => {
        try {
            // https://safe-transaction-arbitrum.safe.global/
            // const allTxsOptions = {
            //   executed: bool,
            //   queued: bool,
            //   trusted: bool,
            // }
            const transactions = await safeService.getAllTransactions(safeAddress, allTxsOptions);
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

    const createAndApproveTransaction = async (safe, safeService, safeAddress, tx, fromAddress) => {
        try {
            const safeTx = await safe.createTransaction({
                safeTransactionData: {
                    to: ethers.utils.getAddress(tx.params.request.params[0].to),
                    data: tx.params.request.params[0].data,
                    value: tx.params.request.params[0].value ? tx.params.request.params[0].value : 0,
                },
            });
            const txhash = await safe.getTransactionHash(safeTx);
            const signature = await safe.signTransactionHash(txhash);
            safeTx.addSignature(signature);
            await safeService.proposeTransaction({
                safeAddress: ethers.utils.getAddress(safeAddress),
                senderAddress: ethers.utils.getAddress(fromAddress),
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

    const createAndApproveSwapTransaction = async (network, safeAddress, contractTx, tx, fromAddress) => {
        try {
            const safeSdk = await getSafeSdk(safeAddress);
            const safeTransaction = await safeSdk.createTransaction(
                {
                    safeTransactionData: [
                        {
                            to: ethers.utils.getAddress(contractTx.to),
                            data: contractTx.data,
                            value: 0,
                        },
                        {
                            to: ethers.utils.getAddress(tx.to),
                            data: tx.data,
                            value: tx.value,
                        },
                    ],
                },
                // { nonce: ??? } // add nonce value to replace an existing transaction if needed
            );
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            const safeService = await getSafeService(network);
            await safeService.proposeTransaction({
                safeAddress: ethers.utils.getAddress(safeAddress),
                senderAddress: ethers.utils.getAddress(fromAddress),
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderSignature: senderSignature.data,
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
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const addSafeOwner = async (safeAddress, params) => {
        try {
            const safeSdk = await getSafeSdk(safeAddress);
            const safeTransaction = await safeSdk.createAddOwnerTx(params);
            const txResponse = await safeSdk.executeTransaction(safeTransaction);
            const resp = await txResponse.transactionResponse?.wait();
            return resp;
        } catch (error) {
            return toast({
                description: `Failed to add safe owner: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const removeSafeOwner = async (safeAddress, params) => {
        try {
            const safeSdk = await getSafeSdk(safeAddress);
            const safeTransaction = await safeSdk.createRemoveOwnerTx(params);
            const txResponse = await safeSdk.executeTransaction(safeTransaction);
            const resp = await txResponse.transactionResponse?.wait();
            return resp;
        } catch (error) {
            return toast({
                description: `Failed to remove safe owner: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const editSafeThreshold = async (safeAddress, newThreshold) => {
        try {
            const safeSdk = await getSafeSdk(safeAddress);
            const safeTransaction = await safeSdk.createChangeThresholdTx(newThreshold);
            const txResponse = await safeSdk.executeTransaction(safeTransaction);
            const resp = await txResponse.transactionResponse?.wait();
            return resp;
        } catch (error) {
            return toast({
                description: `Failed to remove safe owner: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const confirmTransaction = async (safeService, safeAddress, safeTxHash) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const safeOwner = provider.getSigner(0);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            const safeSdk = await Safe.create({ ethAdapter, safeAddress });
            const signature = await safeSdk.signTransactionHash(safeTxHash);
            await safeService.confirmTransaction(safeTxHash, signature.data);
            return true;
        } catch (error) {
            if (error.message === "SafeProxy contract is not deployed on the current network") {
                return toast({
                    description: "Failed to confirm transaction: wallet and transaction network mismatch.",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
            toast({
                description: `Failed to confirm transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const executeTransaction = async (safeService, safeAddress, safeTxHash) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const safeOwner = provider.getSigner(0);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            const safeSdk = await Safe.create({ ethAdapter, safeAddress });
            const safeTransaction = await safeService.getTransaction(safeTxHash);
            const txResponse = await safeSdk.executeTransaction(safeTransaction);
            const resp = await txResponse.transactionResponse?.wait();
            return resp;
        } catch (error) {
            if (error.message === "SafeProxy contract is not deployed on the current network") {
                return toast({
                    description: "Failed to execute transaction: wallet and transaction network mismatch.",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
            toast({
                description: `Failed to execute transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setTimeout(() => {
                getLatestGnosisData();
            }, 10000);
        }
    };

    const loadSafe = async (safeAddress, network) => {
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
            const safe = await Safe.create({ ethAdapter, safeAddress });
            return { gnosisSafe: safe, safeService };
        } catch (error) {
            console.error(error);
        }
    };
    const createSafe = async ({ owners, threshold, network, onTransactionSent }) => {
        try {
            checkNetwork(network);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const safeOwner = provider.getSigner(0);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            // Generate a unique saltNonce using a timestamp
            const saltNonce = new Date().getTime().toString();
            const safe = await SafeFactory.create({ ethAdapter });
            await safe.deploySafe({
                safeAccountConfig: {
                    owners,
                    threshold,
                },
                saltNonce,
                callback: (txHash) => {
                    console.log(`Safe creation transaction sent: ${txHash}`);
                    if (onTransactionSent) {
                        onTransactionSent(txHash);
                    }
                },
            });
            return true;
        } catch (error) {
            console.error(error);
            toast({
                description: `Failed to create safe: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };
    const refreshSafeList = async ({ walletAddress }) => {
        try {
            if (user && user.uid && currentTeam && currentTeam.id) {
                const allSafesPromises = Object.keys(networks).map(async (key) => {
                    if (!networks[key].safeTransactionService) {
                        return []; // Skip if no safeTransactionService is defined
                    }
                    const safeService = await getSafeService(key);
                    if (!safeService) {
                        return []; // Skip if the Safe service couldn't be initialized
                    }
                    const { safes } = await getSafesByOwner(safeService, walletAddress);
                    if (!safes || safes.length === 0) {
                        return []; // Skip if no safes found
                    }
                    const safeDetails = await Promise.all(
                        safes.map(async (safeAddress) => {
                            const safeInfo = await getSafeInfo(safeService, safeAddress);
                            return {
                                network: key,
                                safeAddress,
                                owners: safeInfo.owners,
                                threshold: safeInfo.threshold,
                            };
                        }),
                    );
                    return safeDetails;
                });

                const allSafesNested = await Promise.all(allSafesPromises);
                const allSafes = allSafesNested.flat(); // Flatten the nested arrays
                // Process the fetched safes as needed, e.g., update state, store in database, etc.
                const safesRef = doc(db, "users", user.uid, "teams", currentTeam.id);
                await setDoc(safesRef, { safes: allSafes }, { merge: true });
                getUserTeamsData();
                return allSafes;
            }
        } catch (error) {
            console.error(error);
            toast({
                description: `Failed to refresh safes list: ${error.message}`,
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
        createAndApproveSwapTransaction,
        addSafeOwner,
        removeSafeOwner,
        editSafeThreshold,
        confirmTransaction,
        executeTransaction,
        loadSafe,
        createSafe,
        refreshSafeList,
    };
};

export default useGnosisSafe;
