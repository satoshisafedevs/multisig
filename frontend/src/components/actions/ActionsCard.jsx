import React, { useState } from "react";
import { Card, CardHeader, CardBody, Heading, Stack } from "@chakra-ui/react";
import HeaderTab from "../HeaderTab";
import WalletConnect from "./WalletConnect";
import Swap from "./Swap";
import Send from "./Send";

export default function ActionsCard() {
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
                        <HeaderTab isActive={activeTab === "send"} onClick={() => setActiveTab("send")}>
                            Send
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
                <div style={{ display: activeTab === "swap" ? "unset" : "none" }}>
                    <Swap />
                </div>
                <div style={{ display: activeTab === "send" ? "unset" : "none" }}>
                    <Send />
                </div>
                <div style={{ display: activeTab === "walletconnect" ? "unset" : "none" }}>
                    <WalletConnect />
                </div>
            </CardBody>
        </Card>
    );
}
