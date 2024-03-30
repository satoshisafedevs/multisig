import { Button, Flex, HStack, Heading, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { isEmpty } from "lodash";
import React, { useEffect } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { useWalletConnect } from "../../providers/WalletConnect";
import WalletConnectIntegrationModal from "./WalletConnetIntegrationModal";

export default function WalletConnect() {
    const { createWeb3Wallet, disconnect, sessions } = useWalletConnect();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        createWeb3Wallet();
    }, []);

    return (
        <Flex direction="column" align="start" p={4} height="100%">
            <Heading size="sm" mt="20px">
                Paired dApps
            </Heading>
            <VStack flex="1" overflowY="auto" minHeight="200px" width="100%">
                {" "}
                {/* Scrollable and flexible container for sessions */}
                {sessions && !isEmpty(sessions) ? (
                    Object.values(sessions).map((session) => {
                        const { name } = session.peer.metadata;
                        const { topic } = session;
                        return (
                            <HStack key={topic} width="100%" justifyContent="space-between">
                                <Text>{name}</Text>
                                <Button onClick={() => disconnect(topic)} size="sm">
                                    X
                                </Button>
                            </HStack>
                        );
                    })
                ) : (
                    <>
                        <IoAddCircleOutline size="48px" color="gray.300" />
                        <Text textAlign="center" color="gray.500">
                            You don&apos;t have any connections yet. Pair with a dApp to get started.
                        </Text>
                        <Button colorScheme="blueSwatch" onClick={onOpen}>
                            Pair a New dApp
                        </Button>
                    </>
                )}
            </VStack>
            {/* Button at the bottom */}
            {sessions && !isEmpty(sessions) && (
                <Button onClick={onOpen} colorScheme="blueSwatch" w="100%">
                    Add Connection
                </Button>
            )}

            <WalletConnectIntegrationModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
        </Flex>
    );
}
