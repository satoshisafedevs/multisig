import React, { useState } from "react";
import { Card, CardHeader, CardBody, Heading, Button, Stack } from "@chakra-ui/react";

export default function ActionCard() {
    const [activeTab, setActiveTab] = useState("swap");

    const renderBody = () => {
        if (activeTab === "swap") {
            return <div>Swap</div>;
        }
        if (activeTab === "walletconnect") {
            return <div>WalletConnect</div>;
        }
        return null;
    };
    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Stack spacing="24px" display="flex" direction="row" align="baseline">
                    <Heading size="md">Actions</Heading>
                    <>
                        <Button
                            variant="link"
                            size="xs"
                            fontWeight={activeTab === "swap" && "bold"}
                            minWidth="34px"
                            onClick={() => setActiveTab("swap")}
                        >
                            Swap
                        </Button>
                        <Button
                            variant="link"
                            size="xs"
                            fontWeight={activeTab === "walletconnect" && "bold"}
                            minWidth="82px"
                            onClick={() => setActiveTab("walletconnect")}
                        >
                            WalletConnect
                        </Button>
                    </>
                </Stack>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="0" paddingBottom="0">
                {renderBody()}
            </CardBody>
        </Card>
    );
}
