import React, { useEffect, useState, useRef } from "react";
import { Grid, GridItem, Spinner } from "@chakra-ui/react";
import UpdateProfileModal from "../components/UpdateProfileModal";
import Header from "../components/Header";
import Portfolio from "../components/home/Portfolio";
import ControlPanel from "../components/home/ControlPanel";
import ActionCard from "../components/actions/ActionCard";
import { useUser } from "../providers/User";
import { useWagmi } from "../providers/Wagmi";

function Home() {
    const { currentTeam, teamUsersInfo, firestoreUser } = useUser();
    const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false);
    const { walletMismatch } = useWagmi();
    const [chartHeight, setChartHeight] = useState();
    const [expandPortfolio, setExpandPortfolio] = useState(false);
    const gridRef = useRef();

    useEffect(() => {
        document.title = "Satoshi Safe";
    }, []);

    useEffect(() => {
        if (firestoreUser && !firestoreUser.displayName) {
            setUpdateProfileModalOpen(true);
        }
    }, [firestoreUser]);

    useEffect(() => {
        if (currentTeam && teamUsersInfo) {
            const updateSize = () => {
                if (gridRef.current) {
                    setTimeout(() => {
                        setChartHeight(gridRef.current.clientHeight);
                    }, 25);
                }
            };
            updateSize();
            window.addEventListener("resize", updateSize);
            return () => window.removeEventListener("resize", updateSize);
        }
    }, [currentTeam, teamUsersInfo, walletMismatch, expandPortfolio]);

    const expandAction = () => setExpandPortfolio((prevState) => !prevState);

    return (
        <>
            <Header withTeam />
            <UpdateProfileModal isOpen={updateProfileModalOpen} setIsOpen={setUpdateProfileModalOpen} />
            {currentTeam && teamUsersInfo ? (
                <Grid
                    height="100%"
                    minHeight="500px"
                    gap="20px"
                    padding="10px"
                    gridTemplateRows={expandPortfolio ? "1fr" : "1fr 1fr"}
                    gridTemplateColumns={expandPortfolio ? "1fr" : "1fr 1fr"}
                    gridTemplateAreas={expandPortfolio ? "'two''two'" : "'two three''four three'"}
                    transition="all 0.5s"
                >
                    <GridItem minWidth="350px" minHeight="100%" area="two" ref={gridRef} transition="all 0.5s">
                        <Portfolio
                            chartHeight={chartHeight}
                            expandAction={expandAction}
                            expandPortfolio={expandPortfolio}
                        />
                    </GridItem>
                    <GridItem minWidth="350px" area="three" display={expandPortfolio ? "none" : "auto"}>
                        <ControlPanel />
                    </GridItem>
                    <GridItem minWidth="270px" minHeight="100%" area="four" display={expandPortfolio ? "none" : "auto"}>
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
