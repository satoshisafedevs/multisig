import { useToast } from "@chakra-ui/react";
import SafeApiKit from "@safe-global/api-kit";
import Safe, { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import _ from "lodash";
import { ethers } from "ethers";
import { Timestamp, db, doc, setDoc, transactions, updateDoc, getDoc } from "../firebase";
import { useUser } from "../providers/User";
import { convertToISOString, filterOutKeyObject } from "../utils";
import checkNetwork from "../utils/checkNetwork";
import networks from "../utils/networks.json";

const useGnosisSafe = () => {
    const toast = useToast();
    const { user, currentTeam, getUserTeamsData, setCurrentTeam, userTeamData } = useUser();

    const postNewTransactionToDb = async (network, safe, safeTxHash, satoshiData) => {
        try {
            await transactions({
                method: "POST",
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
            });
        } catch (error) {
            toast({
                description: `Failed to post new transaction: ${error}`,
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
            const allTxs = await safeService.getAllTransactions(safeAddress, allTxsOptions);
            return allTxs;
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
                description: `Failed to create and sign send transaction: ${error.message}`,
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
                description: `Failed to create and sign swap transaction: ${error.message}`,
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
                description: `Failed to create and sign add safe owner transaction: ${error.message}`,
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
                description: `Failed to to create and sign remove safe owner transaction: ${error.message}`,
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
                description: `Failed to create and sign remove safe owner transaction: ${error.message}`,
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
            await safe.deploySafe({
                safeAccountConfig: {
                    owners,
                    threshold,
                },
                saltNonce,
                callback: (txHash) => {
                    postNewTransactionToDb(network, "pending", txHash, {
                        type: "CreateSafe",
                        transactionHash: txHash,
                        owners,
                        threshold,
                    });
                    if (onTransactionSent) {
                        onTransactionSent(txHash);
                    }
                },
            });
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
                    const safeDetails = [];
                    // eslint-disable-next-line no-restricted-syntax
                    for (const safeAddress of safes) {
                        try {
                            // eslint-disable-next-line no-await-in-loop
                            const safeInfo = await getSafeInfo(safeService, safeAddress);
                            safeDetails.push({
                                network: key,
                                safeAddress,
                                owners: safeInfo.owners,
                                threshold: safeInfo.threshold,
                                eip: networks[key].eip,
                            });
                        } catch (error) {
                            console.error(
                                `Failed to fetch details for safe ${safeAddress} in network ${key}: ${error}`,
                            );
                            // Optionally handle the error, e.g., logging or tracking failed safeAddresses
                            // Continue to the next safe without stopping the loop
                        }
                    }
                    return safeDetails;
                });
                const allSafesNested = await Promise.all(allSafesPromises);
                const allSafes = allSafesNested.flat(); // Flatten the nested arrays
                const cleanedSafes = allSafes.map((safe) => _.omitBy(safe, _.isUndefined));

                // Process the fetched safes as needed, e.g., update state, store in database, etc.
                const safesRef = doc(db, "users", user.uid, "teams", currentTeam.id);
                const teamSnapshot = await getDoc(safesRef);
                const teamData = teamSnapshot.data();
                // Determine the previous length, treating null as an empty array
                const previousSafesLength = teamData && teamData.safes ? teamData.safes.length : 0;

                // Perform updates only if there's a change in the number of safes
                if (cleanedSafes.length !== previousSafesLength) {
                    await setDoc(safesRef, { safes: cleanedSafes }, { merge: true });
                    getUserTeamsData();
                }
                return cleanedSafes;
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

    const importSafes = async ({ checkedSafes }) => {
        const entries = Object.entries(checkedSafes);
        const newSafes = entries
            .filter(([, value]) => value)
            .map(([key]) => {
                const safeData = userTeamData.userSafes.find((safe) => safe.safeAddress === key);
                return { ...safeData, addedAt: Timestamp.now() };
            });

        if (newSafes.length > 0) {
            try {
                const teamRef = doc(db, "teams", currentTeam.id);
                const teamSnap = await getDoc(teamRef);
                const teamData = teamSnap.data();

                const existingSafes = teamData?.safes || [];
                const safesToAdd = newSafes.filter(
                    (newSafe) =>
                        !existingSafes.some((existingSafe) => existingSafe.safeAddress === newSafe.safeAddress),
                );

                if (safesToAdd.length > 0) {
                    await updateDoc(teamRef, {
                        safes: [...existingSafes, ...safesToAdd],
                    });

                    setCurrentTeam((prevState) => ({
                        ...prevState,
                        safes: [...(prevState?.safes || []), ...safesToAdd],
                    }));
                }
            } catch (error) {
                console.error("Error importing safes:", error);
                throw new Error("Error importing safes");
            }
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
        importSafes,
    };
};

export default useGnosisSafe;
