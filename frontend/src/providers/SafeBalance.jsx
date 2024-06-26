import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { db, collection, query, orderBy, limit, where, getDocs, updateSafeBalances } from "../firebase";
import { useUser } from "./User";
import { addMissingDate } from "../utils";

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
        const totalBalanceRef = collection(db, "assetsByWalletAddress", safeAddress, "totalBalance");
        const allTokenListRef = collection(db, "assetsByWalletAddress", safeAddress, "allTokenList");
        const complexProtocolListRef = collection(db, "assetsByWalletAddress", safeAddress, "complexProtocolList");

        const latestBalance = await getDocs(query(totalBalanceRef, orderBy("createdAt", "desc"), limit(1)));
        const latestToken = await getDocs(query(allTokenListRef, orderBy("createdAt", "desc"), limit(1)));
        const latestProtocol = await getDocs(query(complexProtocolListRef, orderBy("createdAt", "desc"), limit(1)));

        const walletAssets = latestToken.docs.map((doc) => {
            const { data } = doc.data();
            return { [safeAddress]: data.filter((el) => el.is_wallet === true) };
        });
        const stakedAssets = latestProtocol.docs.map((doc) => {
            const { data } = doc.data();
            return { [safeAddress]: data };
        });
        const portfolio = latestBalance.docs.map((doc) => {
            const data = doc.data();
            const filteredChainList = data.chain_list.filter((chain) => chain.usd_value !== 0);
            data.chain_list = filteredChainList;
            return { [safeAddress]: data };
        });

        const allBalances = await getDocs(
            query(totalBalanceRef, where("createdAt", ">=", addedAt), orderBy("createdAt", "asc")),
        );
        const historicalBalances = allBalances.docs.reduce((accumulator, doc) => {
            const data = doc.data();
            const dateStr = formatDate(data.createdAt);

            accumulator[dateStr] = data.total_usd_value;

            return accumulator;
        }, {});

        return { portfolio, historicalBalances, walletAssets, stakedAssets };
    } catch (error) {
        console.error(`Failed to fetch and process data for ${safe.safeAddress}: ${error.message}`);
        return null;
    }
};

function SafeBalance({ children }) {
    const { currentTeam } = useUser();
    const [safesPortfolio, setSafesPortfolio] = useState();
    const [todaysAggregatedBalance, setTodaysAggregatedBalance] = useState();
    const [historicalTotalBalance, setHistoricalTotalBalance] = useState();
    const [safesWalletAssets, setSafesWalletAssets] = useState();
    const [todaysAggregatedSafesWalletAssets, setTodaysAggregatedSafesWalletAssets] = useState();
    const [safesStackedAssets, setSafesStackedAssets] = useState();
    const [todaysAggregatedSafesStakedAssets, setTodaysAggregatedSafesStakedAssets] = useState();
    const [gettingData, setGettingData] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            if (currentTeam && currentTeam.safes && !gettingData) {
                try {
                    setGettingData(true);
                    const results = await Promise.all(currentTeam.safes.map((safe) => fetchAndProcessSafeData(safe)));
                    let portfolios = {};
                    let allWalletAssets = {};
                    let allStakedAssets = {};
                    let balance = {};
                    results.forEach((result) => {
                        portfolios = { ...portfolios, ...result.portfolio[0] };
                        allWalletAssets = { ...allWalletAssets, ...result.walletAssets[0] };
                        allStakedAssets = { ...allStakedAssets, ...result.stakedAssets[0] };
                        Object.keys(result.historicalBalances).forEach((dateStr) => {
                            if (!balance[dateStr]) {
                                balance[dateStr] = result.historicalBalances[dateStr];
                            } else {
                                balance[dateStr] += result.historicalBalances[dateStr];
                            }
                        });
                    });
                    balance = addMissingDate(balance);
                    setSafesPortfolio(portfolios);
                    setSafesWalletAssets(allWalletAssets);
                    setSafesStackedAssets(allStakedAssets);
                    setHistoricalTotalBalance(balance);
                    setGettingData(false);
                    setInitialLoading(false);
                } catch (error) {
                    console.error(`Failed to fetch and process data: ${error.message}`);
                }
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

            // Assuming safe.chain_list is already filtered to remove zero usd_value items
            safe.chain_list.forEach((chain) => {
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

    const calculateTodaysWalletAssets = useCallback(() => {
        const balances = [];
        let totalUSDValue = 0;

        Object.keys(safesWalletAssets).forEach((safe) => {
            safesWalletAssets[safe].forEach((token) => {
                let existingTokenIndex = "";

                if (token.display_symbol) {
                    existingTokenIndex = balances.findIndex((b) => b.display_symbol === token.display_symbol);
                } else {
                    existingTokenIndex = balances.findIndex((b) => b.symbol === token.symbol);
                }

                if (existingTokenIndex !== -1) {
                    // if the token is already present in the balances array, add to its amount and USD value
                    balances[existingTokenIndex].amount += token.amount;
                    balances[existingTokenIndex].usdValue += token.price * token.amount;
                } else {
                    // otherwise, add a new object to the array
                    balances.push({
                        symbol: token.display_symbol || token.symbol,
                        price: token.price,
                        amount: token.amount,
                        usdValue: token.price * token.amount,
                    });
                }

                // add to the total USD value
                totalUSDValue += token.price * token.amount;
            });
        });

        setTodaysAggregatedSafesWalletAssets({ balances, totalUSDValue });
    }, [safesWalletAssets]);

    useEffect(() => {
        if (safesWalletAssets) {
            calculateTodaysWalletAssets();
        }
    }, [safesWalletAssets, calculateTodaysWalletAssets]);

    const callUpdateSafeBalances = async () => {
        if (currentTeam && currentTeam.safes) {
            await updateSafeBalances({
                safes: currentTeam?.safes,
                teamName: currentTeam?.name,
                teamId: currentTeam?.id,
            });
        }
    };

    const calculateTodaysStackedAssets = useCallback(() => {
        const balances = [];
        let totalUSDValue = 0;

        Object.keys(safesStackedAssets).forEach((safe) => {
            safesStackedAssets[safe].forEach((token) => {
                let existingTokenIndex = balances.findIndex((b) => b.name === token.name);
                let tokenBalance = 0;

                if (existingTokenIndex === -1) {
                    balances.push({ name: token.name, usdValue: tokenBalance, assets: [] });
                    existingTokenIndex = balances.length - 1; // update the index to point to the new token
                }

                token.portfolio_item_list.forEach((item) => {
                    tokenBalance += item.stats.net_usd_value;
                    totalUSDValue += item.stats.net_usd_value;

                    item.asset_token_list.forEach((asset) => {
                        const existingAsset = balances[existingTokenIndex].assets.findIndex(
                            (a) => a.optimized_symbol === asset.optimized_symbol,
                        );

                        if (existingAsset !== -1) {
                            balances[existingTokenIndex].assets[existingAsset].amount += asset.amount;
                            balances[existingTokenIndex].assets[existingAsset].value += asset.amount * asset.price;
                        } else {
                            balances[existingTokenIndex].assets.push({
                                optimized_symbol: asset.optimized_symbol,
                                price: asset.price,
                                amount: asset.amount,
                                value: asset.amount * asset.price,
                            });
                        }
                    });
                });

                balances[existingTokenIndex].usdValue += tokenBalance;
                // update the usdValue of the token after summing up all items
            });
        });
        setTodaysAggregatedSafesStakedAssets({ balances, totalUSDValue });
    }, [safesStackedAssets]);

    useEffect(() => {
        if (safesStackedAssets) {
            calculateTodaysStackedAssets();
        }
    }, [safesStackedAssets, calculateTodaysStackedAssets]);

    const resetBalanceData = () => {
        setHistoricalTotalBalance(null);
        setTodaysAggregatedBalance(null);
        setSafesPortfolio(null);
        setTodaysAggregatedSafesWalletAssets(null);
        setTodaysAggregatedSafesStakedAssets(null);
    };

    const values = useMemo(
        () => ({
            safesPortfolio,
            todaysAggregatedBalance,
            todaysAggregatedSafesWalletAssets,
            todaysAggregatedSafesStakedAssets,
            historicalTotalBalance,
            resetBalanceData,
            initialLoading,
            callUpdateSafeBalances,
        }),
        [
            safesPortfolio,
            todaysAggregatedBalance,
            todaysAggregatedSafesWalletAssets,
            todaysAggregatedSafesStakedAssets,
            historicalTotalBalance,
            resetBalanceData,
            initialLoading,
            callUpdateSafeBalances,
        ],
    );

    return <BalanceProvider value={values}>{children}</BalanceProvider>;
}

SafeBalance.propTypes = {
    children: PropTypes.node.isRequired,
};

export default SafeBalance;
