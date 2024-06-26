import React, { useState } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Spinner, Box, Stack, Button, Card, CardHeader, CardBody, Heading, Flex, IconButton } from "@chakra-ui/react";
import { IoExpandOutline, IoContractOutline, IoRefresh } from "react-icons/io5";
import { useSafeBalance } from "../../providers/SafeBalance";
import LineChart from "./LineChart";
import WalletAssetsTable from "./WalletAssetsTable";
import StakedAssetsTable from "../StakedAssetsTable";

function Portfolio({ chartHeight, expandPortfolio, expandAction }) {
    const [activeTab, setActiveTab] = useState("chart");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const {
        safesPortfolio,
        todaysAggregatedSafesWalletAssets,
        todaysAggregatedSafesStakedAssets,
        historicalTotalBalance,
        initialLoading,
        callUpdateSafeBalances,
    } = useSafeBalance();

    const updateSafeBalances = async () => {
        setIsRefreshing(true); // Start the spinner when the refresh starts
        await callUpdateSafeBalances();
        setIsRefreshing(false);
    };

    const convertedDates = (data) => {
        const converted = {};
        const keys = Object.keys(data);
        keys.forEach((key) => {
            const date = new Date(key);
            const options = { month: "short", day: "numeric", timeZone: "UTC" };
            const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
            converted[formattedDate] = data[key];
        });

        return converted;
    };

    const renderBody = () => {
        if (initialLoading) {
            return (
                <Flex align="center" justify="center" height="100%">
                    <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" />
                </Flex>
            );
        }
        if (chartHeight && activeTab === "chart") {
            // deducting the heigh of top/bottom padding and card title for perfect chart resize
            if (!isEmpty(historicalTotalBalance)) {
                return (
                    <Box position="relative" display="inline-block" width="100%" height={chartHeight - 20 * 2 - 32}>
                        <LineChart
                            xData={Object.keys(convertedDates(historicalTotalBalance))}
                            yData={Object.values(historicalTotalBalance)}
                        />
                    </Box>
                );
            }
            return (
                <Box position="relative" display="inline-block" width="100%" height={chartHeight - 20 * 2 - 32}>
                    <LineChart />
                </Box>
            );
        }
        if (todaysAggregatedSafesWalletAssets && activeTab === "wallet") {
            return <WalletAssetsTable todaysAggregatedSafesWalletAssets={todaysAggregatedSafesWalletAssets} />;
        }
        if (todaysAggregatedSafesStakedAssets && activeTab === "staked") {
            return <StakedAssetsTable todaysAggregatedSafesStakedAssets={todaysAggregatedSafesStakedAssets} />;
        }
    };

    return (
        <Card height="100%" overflow="auto">
            <CardHeader paddingBottom="0">
                <Stack display="flex" direction="row" align="baseline">
                    <Heading size="md" paddingRight="8px">
                        Portfolio
                    </Heading>
                    {safesPortfolio && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                fontWeight={activeTab === "chart" && "bold"}
                                minWidth="58.5px"
                                onClick={() => setActiveTab("chart")}
                                colorScheme="blueSwatch"
                            >
                                Chart
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                fontWeight={activeTab === "wallet" && "bold"}
                                minWidth="107px"
                                onClick={() => setActiveTab("wallet")}
                                colorScheme="blueSwatch"
                            >
                                Wallet Assets
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                fontWeight={activeTab === "staked" && "bold"}
                                minWidth="113px"
                                onClick={() => setActiveTab("staked")}
                                colorScheme="blueSwatch"
                            >
                                Staked Assets
                            </Button>
                        </>
                    )}
                </Stack>
                {!isEmpty(historicalTotalBalance) && (
                    <IconButton
                        icon={isRefreshing ? <Spinner size="sm" /> : <IoRefresh />}
                        onClick={updateSafeBalances}
                        position="absolute"
                        top="0"
                        right={{ base: "40px", md: "40px" }} // Adjust this value based on the existing layout
                        background="none"
                        isLoading={isRefreshing} // Use the loading state to control the spinner
                    />
                )}
                <IconButton
                    icon={expandPortfolio ? <IoContractOutline /> : <IoExpandOutline />}
                    onClick={expandAction}
                    position="absolute"
                    top="0"
                    right="0"
                    background="none"
                />
            </CardHeader>
            <CardBody paddingTop="0" overflow={activeTab === "chart" ? "hidden" : "auto"}>
                {renderBody()}
            </CardBody>
        </Card>
    );
}

Portfolio.propTypes = {
    chartHeight: PropTypes.number,
    expandPortfolio: PropTypes.bool,
    expandAction: PropTypes.func,
};
export default Portfolio;
