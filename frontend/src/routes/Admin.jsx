import React, { useEffect } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import Header from "../components/Header";
import PreferenceTabs from "../components/admin/PreferenceTabs"; // Import the PreferenceTabs component
import { useUser } from "../providers/User";

function Admin() {
    const { currentTeam, teamUsersInfo } = useUser();

    useEffect(() => {
        document.title = "Admin Panel - Satoshi Safe";
    }, []);

    return (
        <>
            <Header withTeam />
            {currentTeam && teamUsersInfo ? (
                <Flex height="100%" padding="10px" justifyContent="center" maxWidth="100%" overflow="auto">
                    <PreferenceTabs /> {/* Use the PreferenceTabs component */}
                </Flex>
            ) : (
                <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />
            )}
        </>
    );
}

export default Admin;
