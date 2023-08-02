import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel, Box, Card } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PreferenceTabs() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab") || "Profile";

    const handleTabsChange = (index) => {
        const tabName = ["Profile", "Safes", "Teams", "Users", "Notifications"][index];
        navigate(`?tab=${tabName}`);
    };

    const tabIndex = {
        Profile: 0,
        Safes: 1,
        Teams: 2,
        Users: 3,
        Notifications: 4,
    }[tab];

    return (
        <Tabs
            variant="soft-rounded"
            colorScheme="blue"
            isLazy
            height="100%"
            width="100%"
            index={tabIndex}
            onChange={handleTabsChange}
        >
            <Box display="flex" width="100%" height="100%" justifyContent="center">
                <Card width="15%" pr="10px" pt="10px" backgroundColor="white" margin="10px">
                    <TabList flexDirection="column">
                        <Tab _selected={{ bg: "blue.100", borderRadius: "0 5px 5px 0" }}>Profile</Tab>
                        <Tab _selected={{ bg: "blue.100", borderRadius: "0 5px 5px 0" }}>Safes</Tab>
                        <Tab _selected={{ bg: "blue.100", borderRadius: "0 5px 5px 0" }}>Teams</Tab>
                        <Tab _selected={{ bg: "blue.100", borderRadius: "0 5px 5px 0" }}>Users</Tab>
                        <Tab _selected={{ bg: "blue.100", borderRadius: "0 5px 5px 0" }}>Notifications</Tab>
                    </TabList>
                </Card>
                <Card width="40%" padding="10px" backgroundColor="white" minWidth="500px" margin="10px">
                    <TabPanels>
                        <TabPanel>
                            <div>meowmeowmewomewoem</div>
                        </TabPanel>
                        <TabPanel>{/* Safes Content */}</TabPanel>
                        <TabPanel>{/* Teams Content */}</TabPanel>
                        <TabPanel>{/* Users Content */}</TabPanel>
                        <TabPanel>{/* Notifications Content */}</TabPanel>
                    </TabPanels>
                </Card>
            </Box>
        </Tabs>
    );
}

export default PreferenceTabs;
