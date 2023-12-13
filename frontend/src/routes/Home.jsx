import React, { useEffect, useState, useRef } from "react";
import { Box, Spinner } from "@chakra-ui/react";
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
    const [displayStyle, setDisplayStyle] = useState("unset");

    useEffect(() => {
        document.title = "Satoshi Safe";
    }, []);

    useEffect(() => {
        if (firestoreUser && !firestoreUser.displayName) {
            setUpdateProfileModalOpen(true);
        }
    }, [firestoreUser]);

    useEffect(() => {
        if (currentTeam && teamUsersInfo && gridRef.current) {
            const updateSize = () => {
                setChartHeight(gridRef.current.clientHeight);
            };
            updateSize();
            ["resize", "transitionend"].forEach((event) => {
                window.addEventListener(event, updateSize);
            });

            return () =>
                ["resize", "transitionend"].forEach((event) => {
                    window.removeEventListener(event, updateSize);
                });
        }
    }, [currentTeam, teamUsersInfo, walletMismatch, expandPortfolio]);

    const expandAction = () => setExpandPortfolio((prevState) => !prevState);

    useEffect(() => {
        if (expandPortfolio) {
            // Immediately hide when expandPortfolio is true
            setDisplayStyle("none");
        } else {
            // Delay the display change when expandPortfolio is false
            const timer = setTimeout(() => {
                setDisplayStyle("unset");
            }, 200); // Adjust the delay as needed

            // Clear the timeout if the component unmounts or if expandPortfolio changes again
            return () => clearTimeout(timer);
        }
    }, [expandPortfolio]);

    return (
        <>
            <Header withTeam />
            <UpdateProfileModal isOpen={updateProfileModalOpen} setIsOpen={setUpdateProfileModalOpen} />
            {currentTeam && teamUsersInfo ? (
                <Box
                    height="100%"
                    minHeight="500px"
                    gap={!expandPortfolio && "20px"}
                    padding="10px"
                    display="grid"
                    gridTemplateRows={expandPortfolio ? "1fr 0fr" : "1fr 1fr"}
                    gridTemplateColumns={expandPortfolio ? "1fr 0fr" : "1fr 1fr"}
                    transition="all 0.5s"
                >
                    <Box minWidth="350px" minHeight="100%" gridRow="1" ref={gridRef}>
                        <Portfolio
                            chartHeight={chartHeight}
                            expandAction={expandAction}
                            expandPortfolio={expandPortfolio}
                        />
                    </Box>

                    <Box minWidth="270px" minHeight="100%" gridRow="2" display={displayStyle}>
                        <ActionCard />
                    </Box>
                    <Box minWidth="350px" gridRow="1/span 2" display={displayStyle}>
                        <ControlPanel />
                    </Box>
                </Box>
            ) : (
                <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />
            )}
        </>
    );
}

export default Home;
