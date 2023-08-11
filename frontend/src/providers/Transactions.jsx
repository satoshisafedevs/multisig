import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "./User";
import networks from "../components/admin/networks.json";
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
            const transactionDocs = querySnapshot.docs
                .map((msg) => ({
                    ...msg.data(),
                    id: msg.id,
                }))
                .sort(
                    (a, b) =>
                        new Date(a.executionDate || a.submissionDate).getTime() -
                        new Date(b.executionDate || b.submissionDate).getTime(),
                );
            setFirestoreTransactions(transactionDocs);
        });

        return unsubscribe;
    }, [currentTeam, writingInProgress]);

    const getTransactions = async (url, options, allGnosisTransactions, network, safeAddress) => {
        const response = await fetch(url, options);
        const data = await response.json();
        data.results.forEach((result) => {
            allGnosisTransactions.push({
                ...result,
                network,
                safe: safeAddress,
                interface: "GnosisSafe",
            });
        });
        // Recursively get the next set of transactions if they exist
        if (data.next) {
            await getTransactions(data.next, options, allGnosisTransactions, network, safeAddress);
        }
    };

    const writeTransactionsToFirestore = async (transactionsToWrite) => {
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
                            `Batch ${index} write transactions completed,` +
                                `added ${transactionsChunks.length} transactions`,
                        );
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(`Batch ${index} write transactions failed`, error);
                    });
            }),
        );
        setWritingInProgress(false);
    };

    function convertNestedArrays(obj) {
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
    }

    useEffect(() => {
        if (currentTeam?.safes && firestoreTransactions && !gettingData) {
            const getLatestGnosisData = async () => {
                setGettingData(true);
                const allGnosisTransactions = [];

                await Promise.all(
                    currentTeam.safes.map(async (teamSafe) => {
                        const { network, safeAddress } = teamSafe;
                        const url =
                            `${networks[network].safeTransactionService}` +
                            `/api/v1/safes/${safeAddress}/all-transactions/?limit=1000`;
                        const options = { method: "GET" };
                        await getTransactions(url, options, allGnosisTransactions, network, safeAddress);
                    }),
                );

                if (allGnosisTransactions.length !== firestoreTransactions.length) {
                    // do stuff if transactions do not match
                    // Convert firestoreTransactions to a set of submissionDates for faster lookup
                    const firestoreDates = new Set(
                        firestoreTransactions.map((t) => t.submissionDate || t.executionDate),
                    );

                    // Filter objects from allGnosisTransactions that aren't in firestoreTransactions
                    const missingTransactions = allGnosisTransactions.filter(
                        (t) => !firestoreDates.has(t.submissionDate || t.executionDate),
                    );

                    if (missingTransactions.length > 0) {
                        // There are transactions in allGnosisTransactions that aren't in firestoreTransactions
                        // Do stuff with missingTransactions
                        const sanitisedData = missingTransactions.map((t) => convertNestedArrays(t));
                        writeTransactionsToFirestore(sanitisedData);
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
