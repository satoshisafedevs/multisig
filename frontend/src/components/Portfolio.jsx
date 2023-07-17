import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Stack, Button, Card, CardHeader, CardBody, Heading } from "@chakra-ui/react";
import { useSafeBalance } from "../providers/SafeBalance";
import LineChart from "./LineChart";
import AssetsTable from "./AssetsTable";

function Portfolio({ chartHeight }) {
    const [chartActive, setChartActive] = useState(true);
    const { safesPortfolio, todaysAggregatedBalance, historicalTotalBalance } = useSafeBalance();

    const convertedDates = (data) => {
        const converted = {};
        const keys = Object.keys(data);
        keys.forEach((key) => {
            const date = new Date(key);
            const options = { month: "short", day: "numeric" };
            const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
            converted[formattedDate] = data[key];
        });

        return converted;
    };

    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Stack spacing="24px" display="flex" direction="row" align="baseline">
                    <Heading size="md">Portfolio</Heading>
                    {safesPortfolio && (
                        <>
                            <Button
                                variant="link"
                                size="xs"
                                fontWeight={chartActive && "bold"}
                                onClick={() => setChartActive(true)}
                            >
                                Chart
                            </Button>
                            <Button
                                variant="link"
                                size="xs"
                                fontWeight={!chartActive && "bold"}
                                onClick={() => setChartActive(false)}
                            >
                                Assets
                            </Button>
                        </>
                    )}
                </Stack>
            </CardHeader>
            <CardBody paddingTop="0" overflow="auto">
                {/* deducting the heigh of top/bottom padding and card title for perfect chart resize */}
                {chartHeight && chartActive && !historicalTotalBalance && (
                    <Box position="relative" display="inline-block" width="100%" height={chartHeight - 20 * 2 - 30}>
                        <LineChart />
                    </Box>
                )}
                {chartHeight && chartActive && historicalTotalBalance && (
                    <Box position="relative" display="inline-block" width="100%" height={chartHeight - 20 * 2 - 30}>
                        <LineChart
                            xData={Object.keys(convertedDates(historicalTotalBalance))}
                            yData={Object.values(historicalTotalBalance)}
                        />
                    </Box>
                )}
                {!chartActive && <AssetsTable todaysAggregatedBalance={todaysAggregatedBalance} />}
            </CardBody>
        </Card>
    );
}

Portfolio.propTypes = {
    chartHeight: PropTypes.number,
};
export default Portfolio;
