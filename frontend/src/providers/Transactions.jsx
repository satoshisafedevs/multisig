import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "./User";
import fetchPendingSafeDetails from "./utils/fetchPendingSafeDetails";
import getPendingSafes from "./utils/getPendingSafes";
import updatePendingSafes from "./utils/updatePendingSafes";
import networks from "../utils/networks.json";
import {
    db,
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getCountFromServer,
    transactions,
} from "../firebase";
import useGnosisSafe from "../hooks/useGnosisSafe";

const TransactionsContext = createContext();
const TransactionsProvider = TransactionsContext.Provider;

export function useTransactions() {
    return useContext(TransactionsContext);
}

function Transactions({ children }) {
    const { currentTeam, userTeamData } = useUser();
    const [firestoreTransactions, setFirestoreTransactions] = useState();
    const [gettingData, setGettingData] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isBrowserTabActive, setIsBrowserTabActive] = useState(true);
    const [lastActiveTime, setLastActiveTime] = useState(Date.now());
    const [isUserActive, setIsUserActive] = useState(true);
    const activityTimeout = 3 * 60 * 1000; // 3 minutes in milliseconds
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
    const [limitTransactionsValue, setLimitTransactionsValue] = useState(25);
    const [allTransactionsCount, setAllTransactionsCount] = useState(0);
    const [filteredSafes, setFilteredSafes] = useState([]);
    const { refreshSafeList, importSafes } = useGnosisSafe();

    const getAllTransactionCount = async () => {
        const transactionsRef = collection(db, "teams", currentTeam.id, "transactions");
        let transactionsQuery;
        if (filteredSafes.length > 0) {
            transactionsQuery = query(
                transactionsRef,
                where("safe", "in", filteredSafes),
                orderBy("unifiedDate", "desc"),
            );
        } else {
            transactionsQuery = query(transactionsRef, orderBy("unifiedDate", "desc"));
        }
        const snapshot = await getCountFromServer(transactionsQuery);
        setAllTransactionsCount(snapshot && snapshot.data().count);
    };

    const loadMoreTransactions = () => {
        setLimitTransactionsValue((prevValue) => prevValue + 25);
    };

    useEffect(() => {
        if (!currentTeam || !currentTeam.id) return;

        setIsTransactionsLoading(true);
        getAllTransactionCount();

        const transactionsRef = collection(db, "teams", currentTeam.id, "transactions");
        let transactionsQuery;

        if (filteredSafes.length > 0) {
            transactionsQuery = query(
                transactionsRef,
                where("safe", "in", filteredSafes),
                orderBy("unifiedDate", "desc"),
                limit(limitTransactionsValue),
            );
        } else {
            transactionsQuery = query(transactionsRef, orderBy("unifiedDate", "desc"), limit(limitTransactionsValue));
        }

        const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
            let transactionDocs = querySnapshot.docs.map((msg) => ({
                ...msg.data(),
                id: msg.id,
            }));

            if (allTransactionsCount > limitTransactionsValue) {
                transactionDocs = [
                    { id: "loadMore", unifiedDate: transactionDocs[transactionDocs.length - 1].unifiedDate || null },
                    ...transactionDocs,
                ];
            }

            setFirestoreTransactions(transactionDocs);
            setIsTransactionsLoading(false);
        });

        return () => {
            unsubscribe();
            setIsTransactionsLoading(false);
        };
    }, [currentTeam, limitTransactionsValue, allTransactionsCount, filteredSafes]);

    const postNewTransactions = async (tData) => {
        try {
            const response = await transactions({
                method: "POST",
                teamid: currentTeam.id,
                transactions: tData,
            });
            const { data } = response;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    };

    const getTransactionsFromGnosis = async (baseUrl, limitValue, offset) => {
        const response = await fetch(`${baseUrl}?limit=${limitValue}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    };

    // this is so werid: gnosis occasionally returns wrong results with limit more than 10
    async function fetchAndPostTransactions(teamSafe, limitValue = 5, offset = 0) {
        const { network, safeAddress } = teamSafe;
        const { safeTransactionService } = networks[network];
        const baseUrl = `${safeTransactionService}/api/v1/safes/${safeAddress}/all-transactions/`;

        let response = await getTransactionsFromGnosis(baseUrl, limitValue, offset);
        response = response.map((resp) => ({
            ...resp,
            network,
            safe: safeAddress,
            interface: "GnosisSafe",
        }));

        if (response && response.length === 0) {
            return true;
        }
        // console.log("gotTransactionsFromGnosis for ", safeAddress, response);
        // console.log("getting safe data at", new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
        if (response && response.length > 0) {
            const postResponse = await postNewTransactions(response);
            // console.log("postResponse", postResponse);
            if (postResponse && postResponse.fetchMore) {
                // Recursively call the function with updated limit and offset
                await fetchAndPostTransactions(teamSafe, limitValue, offset + limitValue);
            }
        }
    }

    const fetchAndUpdateData = async () => {
        if (currentTeam?.safes?.length > 0) {
            setGettingData(true);
            try {
                await currentTeam.safes.reduce(async (prevPromise, teamSafe) => {
                    await prevPromise;
                    return fetchAndPostTransactions(teamSafe);
                }, Promise.resolve());
            } catch (error) {
                console.error("Error in fetchAndUpdateData function:", error);
            } finally {
                setGettingData(false);
            }
        }
        if (currentTeam && currentTeam.id && userTeamData && userTeamData.userWalletAddress) {
            const pendingSafes = await getPendingSafes({ currentTeam });
            if (pendingSafes && pendingSafes.length > 0) {
                try {
                    const { safesToImport, safesToTxHash } = await fetchPendingSafeDetails({
                        safeTransactions: pendingSafes,
                    });
                    const safesToImportLowercase = safesToImport.map((address) => address.toLowerCase());
                    await refreshSafeList({ walletAddress: userTeamData.userWalletAddress });
                    const filteredUserSafes = userTeamData.userSafes.filter((safe) =>
                        safesToImportLowercase.includes(safe.safeAddress.toLowerCase()),
                    );
                    const importSafesObj = {};
                    if (filteredUserSafes.length > 0) {
                        filteredUserSafes.forEach((safe) => {
                            importSafesObj[safe.safeAddress] = true;
                        });
                        await importSafes({ checkedSafes: importSafesObj });
                        await updatePendingSafes({ filteredUserSafes, pendingSafes, safesToTxHash, currentTeam });
                    }
                } catch (error) {
                    console.error("Error in fetchAndUpdateData function:", error);
                }
            }
        }
    };

    useEffect(() => {
        // handle first page open
        if (!isDataLoaded && currentTeam) {
            // console.log("1");
            fetchAndUpdateData();
            setIsDataLoaded(true);
        }
    }, [isDataLoaded, currentTeam]);

    useEffect(() => {
        let intervalId;
        // Set up the interval only if gettingData is false and currentTeam has safes
        if (!gettingData && isBrowserTabActive && isUserActive) {
            intervalId = setInterval(fetchAndUpdateData, 15000);
        }
        // Clean up the interval on component unmount or when gettingData changes
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [gettingData, currentTeam?.safes, isBrowserTabActive, isUserActive]);

    useEffect(() => {
        // sets the tab inactive and checks for how long, if more than 15 seconds and active again - calls get data
        function handleVisibilityChange() {
            if (document.hidden) {
                setLastActiveTime(Date.now());
                setIsBrowserTabActive(false);
            } else {
                const timeAway = Date.now() - lastActiveTime;
                if (timeAway > 15000) {
                    fetchAndUpdateData();
                }
                setIsBrowserTabActive(true);
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup event listeners on component unmount
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [lastActiveTime]);

    useEffect(() => {
        // sets user to inactive after activityTimeout minutes
        let timeoutId;

        const resetActivityTimeout = () => {
            clearTimeout(timeoutId);
            setIsUserActive(true);
            timeoutId = setTimeout(() => setIsUserActive(false), activityTimeout);
        };

        // Set initial timeout
        timeoutId = setTimeout(() => setIsUserActive(false), activityTimeout);

        // Set up event listeners
        window.addEventListener("mousemove", resetActivityTimeout);
        window.addEventListener("keydown", resetActivityTimeout);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("mousemove", resetActivityTimeout);
            window.removeEventListener("keydown", resetActivityTimeout);
        };
    }, []);

    const values = useMemo(
        () => ({
            firestoreTransactions,
            setFirestoreTransactions,
            fetchAndPostTransactions,
            gettingData,
            setGettingData,
            setIsDataLoaded,
            setAllTransactionsCount,
            loadMoreTransactions,
            isTransactionsLoading,
            setLimitTransactionsValue,
            setFilteredSafes,
        }),
        [
            firestoreTransactions,
            setFirestoreTransactions,
            fetchAndPostTransactions,
            gettingData,
            setGettingData,
            setIsDataLoaded,
            setAllTransactionsCount,
            loadMoreTransactions,
            isTransactionsLoading,
            setLimitTransactionsValue,
            setFilteredSafes,
        ],
    );

    return <TransactionsProvider value={values}>{children}</TransactionsProvider>;
}

Transactions.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Transactions;
