import React, { useEffect, useState, useRef } from "react";
import { Box, Card, CardBody, Grid, GridItem, Heading } from "@chakra-ui/react";
import useAuth from "../hooks/useAuth";
import CompleteProfileModal from "../components/CompleteProfileModal";
import Header from "../components/Header";
import LineChart from "../components/LineChart";
import Chat from "../components/Chat";
import ActionCard from "../actions/ActionCard";
import SafeCard from "../safes/SafeCard";

function Home() {
    const { user } = useAuth();
    const [chartHeight, setChartHeight] = useState();
    const gridRef = useRef();

    useEffect(() => {
        document.title = "Satoshi Safe";
    }, []);

    useEffect(() => {
        if (gridRef.current) {
            setChartHeight(gridRef.current.clientHeight);
        }
    }, [user]);

    useEffect(() => {
        const updateSize = () => {
            if (gridRef.current) {
                setChartHeight(gridRef.current.clientHeight);
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <>
            <CompleteProfileModal />
            <Header />
            <Grid
                height="100%"
                minHeight="500px"
                gap="20px"
                padding="10px"
                gridTemplateRows="1fr 1fr"
                gridTemplateColumns="0.8fr 2fr 1fr"
                gridTemplateAreas="
                    'one two four'
                    'one three four'
                "
            >
                <GridItem minWidth="200px" area="one">
                    <SafeCard />
                </GridItem>
                <GridItem minWidth="350px" minHeight="100%" area="two" ref={gridRef}>
                    <Card height="100%">
                        <CardBody>
                            <Heading size="md">Portfolio</Heading>
                            {/* deducting the heigh of top/bottom padding and card title for perfect chart resize */}
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
                <GridItem minWidth="200px" area="four">
                    <ActionCard />
                </GridItem>
            </Grid>
        </>
    );
}

export default Home;
