import { Box, Card, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Billing from "./Billing";
import Plans from "./Plans";
import Profile from "./Profile";
import Safes from "./Safes";
import Teams from "./Teams";
import Users from "./Users";

function PreferenceTabs() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const colorValue = useColorModeValue("var(--chakra-colors-gray-600)", "var(--chakra-colors-gray-200)");
    const selectedColor = useColorModeValue("white", "var(--chakra-colors-gray-700)");
    const selectedBG = useColorModeValue("var(--chakra-colors-blueSwatch-300)", "var(--chakra-colors-blueSwatch-200)");
    const tab = searchParams.get("tab") || "Profile";

    const handleTabsChange = (index) => {
        const tabName = ["Profile", "Safes", "Teams", "Users", "Plans", "Billing"][index];
        navigate(`?tab=${tabName}`);
    };

    const tabIndex = {
        Profile: 0,
        Safes: 1,
        Teams: 2,
        Users: 3,
        Plans: 4,
        Billing: 5,
    }[tab];

    return (
        <Tabs
            variant="soft-rounded"
            colorScheme="blueSwatch"
            isLazy
            height="100%"
            width="100%"
            index={tabIndex}
            onChange={handleTabsChange}
        >
            <Box display="flex" width="100%" height="100%" justifyContent="center">
                <Card width="25%" pr="10px" pt="10px" mr="10px">
                    <TabList flexDirection="column" mt="20px">
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Profile
                        </Tab>
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Safes
                        </Tab>
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Teams
                        </Tab>
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Users
                        </Tab>
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Plans
                        </Tab>
                        <Tab
                            borderRadius="0 5px 5px 0"
                            color={colorValue}
                            _selected={{ bg: selectedBG, color: selectedColor }}
                        >
                            Billing
                        </Tab>
                    </TabList>
                </Card>
                <Card width="75%" minWidth="560px" marginLeft="10px">
                    <TabPanels p="0px" overflow="auto">
                        <TabPanel m="0px">
                            <Profile />
                        </TabPanel>
                        <TabPanel>
                            <Safes />
                        </TabPanel>
                        <TabPanel>
                            <Teams />
                        </TabPanel>
                        <TabPanel>
                            <Users />
                        </TabPanel>
                        <TabPanel>
                            <Plans />
                        </TabPanel>
                        <TabPanel>
                            <Billing />
                        </TabPanel>
                        <TabPanel>
                            <Text as="i">Work in progress...</Text>
                        </TabPanel>
                    </TabPanels>
                </Card>
            </Box>
        </Tabs>
    );
}

export default PreferenceTabs;
