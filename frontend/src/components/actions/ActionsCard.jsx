import { Box, Button, Card, CardBody, CardHeader, Center, Heading, Image, Stack } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoWalletOutline } from "react-icons/io5";
import { useWagmi } from "../../providers/Wagmi";
import HeaderTab from "../HeaderTab";
import Send from "./Send";
import Swap from "./Swap";
import WalletConnect from "./WalletConnect";

export default function ActionsCard() {
    const [activeTab, setActiveTab] = useState("swap");
    const { metaMaskInstalled } = useWagmi();
    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Stack display="flex" direction="row" align="baseline">
                    <Heading size="md" paddingRight="8px">
                        Actions
                    </Heading>
                    <>
                        <HeaderTab
                            isActive={activeTab === "swap"}
                            onClick={() => metaMaskInstalled && setActiveTab("swap")}
                        >
                            Swap
                        </HeaderTab>
                        <HeaderTab
                            isActive={activeTab === "send"}
                            onClick={() => metaMaskInstalled && setActiveTab("send")}
                        >
                            Send
                        </HeaderTab>
                        <HeaderTab
                            isActive={activeTab === "walletconnect"}
                            onClick={() => metaMaskInstalled && setActiveTab("walletconnect")}
                        >
                            WalletConnect
                        </HeaderTab>
                    </>
                </Stack>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="0" paddingBottom="0">
                <div style={{ display: activeTab === "swap" ? "unset" : "none" }}>
                    {metaMaskInstalled ? (
                        <Swap />
                    ) : (
                        <>
                            <Box
                                position="absolute"
                                width="calc(100% - 38px)"
                                borderRadius="5"
                                padding="20"
                                height="calc(100% - 45px)"
                                backgroundColor="rgba(0, 0, 0, 0.4)"
                                zIndex="1"
                            >
                                <Center height="100%">
                                    <Stack spacing={4} align="center" justify="center">
                                        <Image
                                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                            boxSize="100px"
                                        />
                                        <Heading size="sm" color="white" textAlign="center">
                                            Please install MetaMask and refresh this page.
                                        </Heading>
                                        <Button
                                            leftIcon={<IoWalletOutline />}
                                            size="sm"
                                            colorScheme="orange"
                                            onClick={() => window.open("https://metamask.io/download/", "_blank")}
                                        >
                                            Install MetaMask
                                        </Button>
                                    </Stack>
                                </Center>
                            </Box>
                            <Swap />
                        </>
                    )}
                </div>
                <div style={{ display: metaMaskInstalled && activeTab === "send" ? "unset" : "none" }}>
                    {metaMaskInstalled && <Send />}
                </div>
                <div style={{ display: metaMaskInstalled && activeTab === "walletconnect" ? "unset" : "none" }}>
                    {metaMaskInstalled && <WalletConnect />}
                </div>
            </CardBody>
        </Card>
    );
}
