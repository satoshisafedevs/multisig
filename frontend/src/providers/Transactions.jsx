import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { omit, isEqual } from "lodash";
import { useUser } from "./User";
import networks from "../utils/networks.json";
import { db, doc, collection, writeBatch, onSnapshot } from "../firebase";

const TransactionsContext = createContext();
const TransactionsProvider = TransactionsContext.Provider;

export function useTransactions() {
    return useContext(TransactionsContext);
}

function Transactions({ children }) {
    const { currentTeam } = useUser();
    const [firestoreTransactions, setFirestoreTransactions] = useState();
    const [gettingData, setGettingData] = useState(false);
    const [writingInProgress, setWritingInProgress] = useState(false);

    useEffect(() => {
        if (!currentTeam || !currentTeam.id || writingInProgress) return;

        const transactionsRef = collection(db, "teams", currentTeam.id, "transactions");

        const unsubscribe = onSnapshot(transactionsRef, (querySnapshot) => {
            const transactionDocs = querySnapshot.docs.map((msg) => ({
                ...msg.data(),
                id: msg.id,
            }));

            setFirestoreTransactions(transactionDocs);
        });

        return unsubscribe;
    }, [currentTeam, writingInProgress]);

    const getTransactions = async (baseUrl, options, allGnosisTransactions, network, safeAddress) => {
        const limit = 100;

        const fetchData = async (offset) => {
            const response = await fetch(`${baseUrl}?limit=${limit}&offset=${offset}`, options);
            const data = await response.json();

            data.results.forEach((result) => {
                allGnosisTransactions.push({
                    ...result,
                    network,
                    safe: safeAddress,
                    interface: "GnosisSafe",
                });
            });

            // If the total count is still greater than the current offset plus the limit, fetch the next set
            if (data.count > offset + limit) {
                await fetchData(offset + limit);
            }
        };

        await fetchData(0); // Start fetching from the first set of transactions
    };

    const addTransactionsToFirestore = async (transactionsToWrite) => {
        setWritingInProgress(true);
        const chunkSize = 500;
        const transactionsChunks = [];
        for (let i = 0; i < transactionsToWrite.length; i += chunkSize) {
            transactionsChunks.push(transactionsToWrite.slice(i, i + chunkSize));
        }
        // Process each chunk
        await Promise.all(
            transactionsChunks.map(async (transactionsChunk, index) => {
                const batch = writeBatch(db);
                transactionsChunk.forEach((transaction) => {
                    const ref = doc(collection(db, "teams", currentTeam.id, "transactions"));
                    batch.set(ref, transaction);
                });
                // Commit the batch
                await batch
                    .commit()
                    .then(() => {
                        // eslint-disable-next-line no-console
                        console.log(
                            `Batch ${index} add transactions completed,` +
                                ` added ${transactionsChunks[index].length} transaction(s)`,
                        );
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(`Batch ${index} add transactions failed`, error);
                    });
            }),
        );
        setWritingInProgress(false);
    };

    const updateTransactionsInFirestore = async (transactionsToUpdate) => {
        setWritingInProgress(true);
        const chunkSize = 500;
        const transactionsChunks = [];
        for (let i = 0; i < transactionsToUpdate.length; i += chunkSize) {
            transactionsChunks.push(transactionsToUpdate.slice(i, i + chunkSize));
        }
        // Process each chunk
        await Promise.all(
            transactionsChunks.map(async (transactionsChunk, index) => {
                const batch = writeBatch(db);
                transactionsChunk.forEach((transaction) => {
                    const ref = doc(db, "teams", currentTeam.id, "transactions", Object.keys(transaction)[0]);
                    batch.set(ref, Object.values(transaction)[0]);
                });
                // Commit the batch
                await batch
                    .commit()
                    .then(() => {
                        // eslint-disable-next-line no-console
                        console.log(
                            `Batch ${index} update transactions completed,` +
                                ` updated ${transactionsChunks[index].length} transaction(s)`,
                        );
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(`Batch ${index} update transactions failed`, error);
                    });
            }),
        );
        setWritingInProgress(false);
    };

    const convertNestedArrays = (obj) => {
        if (Array.isArray(obj)) {
            // Check if it's an array of arrays
            if (obj.every((item) => Array.isArray(item))) {
                return obj.map((subArray, index) => ({
                    [index]: convertNestedArrays(subArray),
                }));
            }
            return obj.map((item) => {
                if (typeof item === "object" && item !== null) {
                    // If the item is an object or array, recursively check its properties or elements
                    return convertNestedArrays(item);
                }
                return item;
            });
        }
        if (typeof obj === "object" && obj !== null) {
            // Create a copy of obj to avoid modification of function parameters
            const newObj = { ...obj };
            Object.keys(newObj).forEach((key) => {
                if (typeof newObj[key] === "object" && newObj[key] !== null) {
                    newObj[key] = convertNestedArrays(newObj[key]);
                }
            });
            return newObj; // Return the new object
        }
        return obj;
    };

    useEffect(() => {
        if (currentTeam?.safes && firestoreTransactions && !gettingData) {
            const getLatestGnosisData = async () => {
                setGettingData(true);
                const allGnosisTransactions = [];

                await Promise.all(
                    currentTeam.safes.map(async (teamSafe) => {
                        const { network, safeAddress } = teamSafe;
                        const baseUrl =
                            `${networks[network].safeTransactionService}` +
                            `/api/v1/safes/${safeAddress}/all-transactions/`;
                        const options = { method: "GET" };
                        await getTransactions(baseUrl, options, allGnosisTransactions, network, safeAddress);
                    }),
                );

                if (allGnosisTransactions.length === firestoreTransactions.length) {
                    const nonMatchingTransactions = [];
                    allGnosisTransactions.forEach(async (original) => {
                        const existing = firestoreTransactions.find(
                            (t) =>
                                t.safeTxHash === original.safeTxHash &&
                                (!original.txHash || !t.txHash || t.txHash === original.txHash),
                        );
                        const sanitizedOriginal = convertNestedArrays(original);
                        const transactionID = existing.id;
                        const sanitizedExisting = omit(existing, ["id"]);
                        if (!isEqual(sanitizedOriginal, sanitizedExisting)) {
                            nonMatchingTransactions.push({ [transactionID]: sanitizedOriginal });
                        }
                    });
                    if (nonMatchingTransactions.length > 0) {
                        updateTransactionsInFirestore(nonMatchingTransactions);
                    }
                }

                if (allGnosisTransactions.length !== firestoreTransactions.length) {
                    // do stuff if transactions do not match
                    // Convert firestoreTransactions to a set of safeTxHash for faster lookup
                    const allHashes = new Set(firestoreTransactions.map((t) => t.safeTxHash || t.txHash));

                    // Filter objects from allGnosisTransactions that aren't in firestoreTransactions
                    const missingTransactions = allGnosisTransactions.filter(
                        (t) => !allHashes.has(t.safeTxHash || t.txHash),
                    );

                    if (missingTransactions.length > 0) {
                        // There are transactions in allGnosisTransactions that aren't in firestoreTransactions
                        // Do stuff with missingTransactions
                        const sanitisedData = missingTransactions.map((t) => convertNestedArrays(t));
                        addTransactionsToFirestore(sanitisedData);
                    }
                }
                setGettingData(false);
            };
            getLatestGnosisData();
        }
    }, [currentTeam, firestoreTransactions]);

    const values = useMemo(
        () => ({
            firestoreTransactions,
            setFirestoreTransactions,
        }),
        [firestoreTransactions, setFirestoreTransactions],
    );

    return <TransactionsProvider value={values}>{children}</TransactionsProvider>;
}

Transactions.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Transactions;
