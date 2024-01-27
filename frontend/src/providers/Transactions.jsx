import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "./User";
import networks from "../utils/networks.json";
import { db, collection, onSnapshot } from "../firebase";

const TransactionsContext = createContext();
const TransactionsProvider = TransactionsContext.Provider;

export function useTransactions() {
    return useContext(TransactionsContext);
}

function Transactions({ children }) {
    const { currentTeam, user } = useUser();
    const [firestoreTransactions, setFirestoreTransactions] = useState();
    const [gettingData, setGettingData] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isBrowserTabActive, setIsBrowserTabActive] = useState(true);
    const [lastActiveTime, setLastActiveTime] = useState(Date.now());
    const [isUserActive, setIsUserActive] = useState(true);
    const activityTimeout = 3 * 60 * 1000; // 3 minutes in milliseconds

    useEffect(() => {
        if (!currentTeam || !currentTeam.id) return;

        const transactionsRef = collection(db, "teams", currentTeam.id, "transactions");

        const unsubscribe = onSnapshot(transactionsRef, (querySnapshot) => {
            const transactionDocs = querySnapshot.docs.map((msg) => ({
                ...msg.data(),
                id: msg.id,
            }));

            setFirestoreTransactions(transactionDocs);
        });

        return unsubscribe;
    }, [currentTeam]);

    const postNewTransactions = async (tData) => {
        try {
            const response = await fetch("https://api-transactions-mojsb2l5zq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    teamid: currentTeam.id,
                    transactions: tData,
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            // error
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
    };

    useEffect(() => {
        // handle first page open
        if (!isDataLoaded && currentTeam) {
            if (currentTeam.safes?.length > 0) {
                // console.log("1");
                fetchAndUpdateData();
                setIsDataLoaded(true);
            } else {
                // console.log("2");
                setIsDataLoaded(true);
            }
        }
    }, [isDataLoaded, currentTeam]);

    useEffect(() => {
        let intervalId;
        // Set up the interval only if gettingData is false and currentTeam has safes
        if (!gettingData && isBrowserTabActive && isUserActive && currentTeam?.safes?.length > 0) {
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
        }),
        [
            firestoreTransactions,
            setFirestoreTransactions,
            fetchAndPostTransactions,
            gettingData,
            setGettingData,
            setIsDataLoaded,
        ],
    );

    return <TransactionsProvider value={values}>{children}</TransactionsProvider>;
}

Transactions.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Transactions;
