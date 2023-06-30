import React, { useEffect, useState, useRef } from "react";
import { Box, Card, CardBody, Grid, GridItem, Heading, Spinner } from "@chakra-ui/react";
import Header from "../components/Header";
import LineChart from "../components/LineChart";
import Chat from "../components/Chat";
import ActionCard from "../actions/ActionCard";
import SafeCard from "../safes/SafeCard";
import { useUser } from "../providers/User";

function Home() {
    const { currentTeam, teamUsersDisplayNames } = useUser();
    const [chartHeight, setChartHeight] = useState();
    const gridRef = useRef();

    useEffect(() => {
        document.title = "Satoshi Safe";
    }, []);

    useEffect(() => {
        if (currentTeam && teamUsersDisplayNames) {
            const updateSize = () => {
                if (gridRef.current) {
                    setChartHeight(gridRef.current.clientHeight);
                }
            };
            updateSize();
            window.addEventListener("resize", updateSize);
            return () => window.removeEventListener("resize", updateSize);
        }
    }, [currentTeam, teamUsersDisplayNames]);

    return (
        <>
            <Header withTeam />
            {currentTeam && teamUsersDisplayNames ? (
                <Grid
                    height="100%"
                    minHeight="500px"
                    gap="20px"
                    padding="10px"
                    gridTemplateRows="1fr 1fr"
                    gridTemplateColumns="0.75fr 2fr 1fr"
                    gridTemplateAreas="
                    'one two four'
                    'one three four'
                "
                >
                    <GridItem minWidth="270px" area="one">
                        <SafeCard />
                    </GridItem>
                    <GridItem minWidth="350px" minHeight="100%" area="two" ref={gridRef}>
                        <Card height="100%">
                            <CardBody>
                                <Heading size="md">Portfolio</Heading>
                                {/* deducting the heigh of top/bottom padding and card title
                                 for perfect chart resize */}
                                {chartHeight && (
                                    <Box
                                        position="relative"
                                        display="inline-block"
                                        width="100%"
                                        height={chartHeight - 20 * 2 - 28}
                                    >
                                        <LineChart />
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </GridItem>
                    <GridItem minWidth="350px" minHeight="100%" area="three">
                        <Chat />
                    </GridItem>
                    <GridItem minWidth="270px" area="four">
                        <ActionCard />
                    </GridItem>
                </Grid>
            ) : (
                <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />
            )}
        </>
    );
}

export default Home;
