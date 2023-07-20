import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useToast } from "@chakra-ui/react";
import { db, collection, query, orderBy, limit, where, getDocs } from "../firebase";
import { useUser } from "./User";

const BalanceContext = createContext();
const BalanceProvider = BalanceContext.Provider;

export function useSafeBalance() {
    return useContext(BalanceContext);
}

const formatDate = (firebaseTimestamp) => {
    const date = new Date(firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`;
};

const fetchAndProcessSafeData = async (safe) => {
    try {
        const { safeAddress, addedAt } = safe;
        const docsRef = collection(db, "assetsByWalletAddress", safeAddress, "totalBalance");

        const latestBalance = await getDocs(query(docsRef, orderBy("createdAt", "desc"), limit(1)));
        const portfolio = latestBalance.docs.map((doc) => ({
            [safeAddress]: doc.data(),
        }));

        const allBalances = await getDocs(query(docsRef, where("createdAt", ">=", addedAt)));
        const historicalBalances = allBalances.docs.reduce((accumulator, doc) => {
            const data = doc.data();
            const dateStr = formatDate(data.createdAt);

            if (!accumulator[dateStr]) {
                accumulator[dateStr] = data.total_usd_value;
            } else {
                accumulator[dateStr] += data.total_usd_value;
            }

            return accumulator;
        }, {});

        return { portfolio, historicalBalances };
    } catch (error) {
        const toast = useToast();
        toast({
            description: `Failed to fetch and process safe data: ${error.message}`,
            position: "top",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
        return null;
    }
};

const sortObjectByDate = (object) => {
    const array = Object.entries(object);

    array.sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB;
    });

    return Object.fromEntries(array);
};

function SafeBalance({ children }) {
    const { currentTeam } = useUser();
    const [safesPortfolio, setSafesPortfolio] = useState();
    const [todaysAggregatedBalance, setTodaysAggregatedBalance] = useState();
    const [historicalTotalBalance, setHistoricalTotalBalance] = useState();
    const [gettingData, setGettingData] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            if (currentTeam && currentTeam.safes && !gettingData) {
                setGettingData(true);
                const results = await Promise.all(currentTeam.safes.map((safe) => fetchAndProcessSafeData(safe)));

                let portfolios = {};
                const balance = {};

                results.forEach((result) => {
                    portfolios = { ...portfolios, ...result.portfolio[0] };
                    Object.keys(result.historicalBalances).forEach((dateStr) => {
                        if (!balance[dateStr]) {
                            balance[dateStr] = result.historicalBalances[dateStr];
                        } else {
                            balance[dateStr] += result.historicalBalances[dateStr];
                        }
                    });
                });

                setSafesPortfolio(portfolios);
                setHistoricalTotalBalance(sortObjectByDate(balance));
                setGettingData(false);
                setInitialLoading(false);
            } else {
                setInitialLoading(false);
            }
        };

        setInitialLoading(true);
        fetchAndProcessData();
    }, [currentTeam]);

    const calculateTodaysBalance = useCallback(() => {
        let totalUSDValue = 0;
        const nonZeroUSDValueChains = [];

        Object.values(safesPortfolio).forEach((safe) => {
            totalUSDValue += safe.total_usd_value;

            const filteredChains = safe.chain_list.filter((chain) => chain.usd_value !== 0);

            filteredChains.forEach((chain) => {
                const existingChainName = nonZeroUSDValueChains.find((name) => Object.keys(name)[0] === chain.name);
                if (existingChainName) {
                    existingChainName[chain.name] += chain.usd_value;
                } else {
                    nonZeroUSDValueChains.push({ [chain.name]: chain.usd_value });
                }
            });
        });

        setTodaysAggregatedBalance({ totalUSDValue, nonZeroUSDValueChains });
    }, [safesPortfolio]);

    useEffect(() => {
        if (safesPortfolio) {
            calculateTodaysBalance();
        }
    }, [safesPortfolio, calculateTodaysBalance]);

    const resetBalanceData = () => {
        setHistoricalTotalBalance(null);
        setTodaysAggregatedBalance(null);
        setSafesPortfolio(null);
    };

    const values = useMemo(
        () => ({
            safesPortfolio,
            todaysAggregatedBalance,
            historicalTotalBalance,
            resetBalanceData,
            initialLoading,
        }),
        [safesPortfolio, todaysAggregatedBalance, historicalTotalBalance, resetBalanceData, initialLoading],
    );

    return <BalanceProvider value={values}>{children}</BalanceProvider>;
}

SafeBalance.propTypes = {
    children: PropTypes.node.isRequired,
};

export default SafeBalance;
