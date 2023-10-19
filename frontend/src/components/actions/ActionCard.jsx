import React, { useState } from "react";
import { Card, CardHeader, CardBody, Heading, Stack } from "@chakra-ui/react";
import WalletConnect from "./WalletConnect";
import HeaderTab from "../HeaderTab";

export default function ActionCard() {
    const [activeTab, setActiveTab] = useState("swap");

    const renderBody = () => {
        if (activeTab === "swap") {
            return <div>Swap</div>;
        }
        if (activeTab === "walletconnect") {
            return <WalletConnect />;
        }
        return null;
    };

    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Stack spacing="24px" display="flex" direction="row" align="baseline">
                    <Heading size="md">Actions</Heading>
                    <>
                        <HeaderTab isActive={activeTab === "swap"} onClick={() => setActiveTab("swap")}>
                            Swap
                        </HeaderTab>
                        <HeaderTab
                            isActive={activeTab === "walletconnect"}
                            onClick={() => setActiveTab("walletconnect")}
                        >
                            WalletConnect
                        </HeaderTab>
                    </>
                </Stack>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="0" paddingBottom="0">
                {renderBody()}
            </CardBody>
        </Card>
    );
}
