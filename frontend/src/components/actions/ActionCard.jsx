import React, { useState } from "react";
import { Card, CardHeader, CardBody, Heading, Stack } from "@chakra-ui/react";
import WalletConnect from "./WalletConnect";
import Swap from "./Swap";
import HeaderTab from "../HeaderTab";

export default function ActionCard() {
    const [activeTab, setActiveTab] = useState("swap");

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
                <div style={{ display: activeTab === "swap" ? "block" : "none" }}>
                    <Swap />
                </div>
                <div style={{ display: activeTab === "walletconnect" ? "block" : "none" }}>
                    <WalletConnect />
                </div>
            </CardBody>
        </Card>
    );
}
