import React, { useEffect, useState, useRef } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import UpdateProfileModal from "../components/UpdateProfileModal";
import Header from "../components/Header";
import Portfolio from "../components/home/Portfolio";
import ControlPanel from "../components/home/ControlPanel";
import ActionsCard from "../components/actions/ActionsCard";
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
    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1000);

    const checkScreenSize = () => {
        setIsNarrowScreen(window.innerWidth < 1000);
    };

    useEffect(() => {
        window.addEventListener("resize", checkScreenSize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    useEffect(() => {
        if (currentTeam?.name) {
            document.title = `Home - ${currentTeam.name} - Satoshi Safe`;
            return;
        }
        document.title = "Home - Satoshi Safe";
    }, [currentTeam]);

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

    // Use isNarrowScreen to determine which layout to use
    const renderLayout = () => {
        if (isNarrowScreen) {
            // Layout for narrow screens
            return (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center" // Centers children horizontally
                    width="100%"
                    minHeight="80%" // Ensure it takes at least the full height of the viewport
                    padding="10px"
                >
                    <Box
                        width="100%"
                        minWidth="500px"
                        maxWidth="100vw" // Ensures that the width doesn't exceed the viewport width
                        marginBottom="20px" // Adds some space between the components
                        ref={gridRef}
                        minHeight="300px"
                    >
                        <Portfolio
                            chartHeight={chartHeight}
                            expandAction={expandAction}
                            expandPortfolio={expandPortfolio}
                        />
                    </Box>

                    {/* Control Panel: it will be full width, centered, with a maximum height of 500px */}
                    <Box
                        width="100%"
                        minWidth="500px"
                        maxHeight="700px"
                        marginBottom="20px" // Adds some space between the components
                        overflowY="auto" // Adds scroll if the content exceeds 500px
                        minHeight="300px"
                    >
                        <ControlPanel />
                    </Box>

                    {/* ActionsCard: it will be full width and centered */}
                    <Box
                        width="100%"
                        minWidth="500px"
                        maxWidth="100vw" // Ensures that the width doesn't exceed the viewport width
                        minHeight="300px"
                    >
                        <ActionsCard />
                    </Box>
                </Box>
            );
        }
        // Layout for wider screens
        return (
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

                <Box minWidth="350px" minHeight="100%" gridRow="2" display={displayStyle}>
                    <ActionsCard />
                </Box>
                <Box minWidth="500px" gridRow="1/span 2" display={displayStyle}>
                    <ControlPanel />
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Header withTeam />
            <UpdateProfileModal isOpen={updateProfileModalOpen} setIsOpen={setUpdateProfileModalOpen} />
            {currentTeam && teamUsersInfo ? (
                renderLayout()
            ) : (
                <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />
            )}
        </>
    );
}

export default Home;
