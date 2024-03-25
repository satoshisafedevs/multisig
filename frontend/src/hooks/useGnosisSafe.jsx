import SafeApiKit from "@safe-global/api-kit";
import Safe, { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import networks from "../utils/networks.json";
import checkNetwork from "../utils/checkNetwork";
import { convertToISOString, filterOutKeyObject } from "../utils";
import { db, doc, setDoc, Timestamp } from "../firebase";
import { useUser } from "../providers/User";

const useGnosisSafe = () => {
    const toast = useToast();
    const { user, currentTeam, getUserTeamsData } = useUser();

    const postNewTransactionToDb = async (network, safe, safeTxHash, satoshiData) => {
        try {
            const response = await fetch("https://api-transactions-mojsb2l5zq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    teamid: currentTeam.id,
                    transactions: [
                        {
                            network,
                            safe,
                            safeTxHash,
                            submissionDate: convertToISOString(Timestamp.now()),
                            satoshiData,
                        },
                    ],
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }
            const data = await response.json();
            // eslint-disable-next-line no-console
            console.log("postNewTransaction response:", data);
        } catch (error) {
            toast({
                description: `Failed to post new transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getProtocolKit = async (safeAddress) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            // v6: provider = new ethers.BrowserProvider(window.ethereum);
            const safeOwner = provider.getSigner(0);

            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: safeOwner,
            });
            const protocolKit = await Safe.create({ ethAdapter, safeAddress });
            return protocolKit;
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

    const createAndApproveTransaction = async (
        network,
        safe,
        safeService,
        safeAddress,
        tx,
        fromAddress,
        satoshiData,
    ) => {
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
            await postNewTransactionToDb(network, safeAddress, txhash, satoshiData);
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

    const createAndApproveSendTransaction = async (network, safeAddress, tx, senderAddress, satoshiData) => {
        try {
            const safeSdk = await getProtocolKit(safeAddress);
            const safeTransaction = await safeSdk.createTransaction(
                {
                    safeTransactionData: {
                        to: ethers.utils.getAddress(tx.to),
                        data: tx.data,
                        value: tx.value,
                    },
                },
                // { nonce: 14 }, // add nonce value to replace an existing pending transaction if needed
            );
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, satoshiData);
            const safeService = await getSafeService(network);
            await safeService.proposeTransaction({
                safeAddress: ethers.utils.getAddress(safeAddress),
                senderAddress: ethers.utils.getAddress(senderAddress),
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderSignature: senderSignature.data,
            });
            return true;
        } catch (error) {
            toast({
                description: `Failed to create and approve send transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const createAndApproveSwapTransaction = async (network, safeAddress, contractTx, tx, fromAddress, satoshiData) => {
        try {
            const safeSdk = await getProtocolKit(safeAddress);
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
                // { nonce: ??? } // add nonce value to replace an existing pending transaction if needed
            );
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, satoshiData);
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
                description: `Failed to create and approve swap transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const addSafeOwner = async (network, safeAddress, params, fromAddress, satoshiData) => {
        try {
            const safeSdk = await getProtocolKit(safeAddress);
            const safeTransaction = await safeSdk.createAddOwnerTx(params);
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, satoshiData);
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
                description: `Failed to create and approve add safe owner transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const removeSafeOwner = async (network, safeAddress, params, fromAddress, satoshiData) => {
        try {
            const safeSdk = await getProtocolKit(safeAddress);
            const safeTransaction = await safeSdk.createRemoveOwnerTx(params);
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, satoshiData);
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
                description: `Failed to to create and approve remove safe owner transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const editSafeThreshold = async (network, safeAddress, newThreshold, fromAddress, satoshiData) => {
        try {
            const safeSdk = await getProtocolKit(safeAddress);
            const safeTransaction = await safeSdk.createChangeThresholdTx(newThreshold);
            const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, satoshiData);
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
                description: `Failed to create and approve remove safe owner transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
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
                toast({
                    description: "Failed to confirm transaction: wallet and transaction network mismatch.",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return false;
            }
            toast({
                description: `Failed to confirm transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const rejectTransaction = async (network, safeAddress, nonce, senderAddress) => {
        try {
            const protocolKit = await getProtocolKit(safeAddress);
            const safeTransaction = await protocolKit.createRejectionTransaction(nonce);
            const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
            const senderSignature = await protocolKit.signTransactionHash(safeTxHash);
            await postNewTransactionToDb(network, safeAddress, safeTxHash, {
                type: "rejectTransaction",
                nonce,
            });
            const safeService = await getSafeService(network);
            await safeService.proposeTransaction({
                safeAddress: ethers.utils.getAddress(safeAddress),
                senderAddress: ethers.utils.getAddress(senderAddress),
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderSignature: senderSignature.data,
            });
            return true;
        } catch (error) {
            if (error.message === "SafeProxy contract is not deployed on the current network") {
                toast({
                    description: "Failed to reject transaction: wallet and transaction network mismatch.",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return false;
            }
            toast({
                description: `Failed to reject transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
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
            await txResponse.transactionResponse?.wait();
            return true;
        } catch (error) {
            if (error.message === "SafeProxy contract is not deployed on the current network") {
                toast({
                    description: "Failed to execute transaction: wallet and transaction network mismatch.",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return false;
            }
            toast({
                description: `Failed to execute transaction: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
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
            let txInfo;
            const newSafe = await safe.deploySafe({
                safeAccountConfig: {
                    owners,
                    threshold,
                },
                saltNonce,
                callback: (txHash) => {
                    txInfo = txHash;
                    console.log(`Safe creation transaction sent: ${txHash}`);
                    if (onTransactionSent) {
                        onTransactionSent(txHash);
                    }
                },
            });
            console.log("newSafe and txInfo", newSafe, txInfo);
            // what is in newSafe? is anything in newSafe returned? does it have safeAddress?
            // is txInfo a safeTxHash?
            // await postNewTransactionToDb(network, newSafe, txInfo, satoshiData);
            // need to add newSafe to teamSafes once we know safeAddress
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
                let updatedNetworks = networks;

                if (import.meta.env.MODE !== "development") {
                    updatedNetworks = filterOutKeyObject(networks, "sepolia");
                }

                const allSafesPromises = Object.keys(updatedNetworks).map(async (key) => {
                    if (!updatedNetworks[key].safeTransactionService) {
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
        createAndApproveSendTransaction,
        createAndApproveSwapTransaction,
        addSafeOwner,
        removeSafeOwner,
        editSafeThreshold,
        confirmTransaction,
        rejectTransaction,
        executeTransaction,
        loadSafe,
        createSafe,
        refreshSafeList,
    };
};

export default useGnosisSafe;
