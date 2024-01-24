import React, { useState, useEffect, useRef } from "react";
import {
    Input,
    Image,
    Center,
    Button,
    useToast,
    Flex,
    VStack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Heading,
    Text,
} from "@chakra-ui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { isEmpty } from "lodash";
import wclogo from "../../img/walletconnect_logo.png";
import { useWalletConnect } from "../../providers/WalletConnect";

export default function WalletConnect() {
    const { pair, createWeb3Wallet, ConnectionModal, disconnect, sessions } = useWalletConnect();
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const inputRef = useRef();

    useEffect(() => {
        createWeb3Wallet();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handlePair = async () => {
        try {
            await pair({ uri: inputValue });
        } catch (error) {
            toast({
                description: `WalletConnect Pairing Error: ${error.message}`,
                position: "top",
                status: "error",
                isClosable: true,
            });
        }
        onClose();
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <Flex direction="column" align="start" p={4} height="100%">
            <Heading size="sm" mt="20px">
                Paired dApps
            </Heading>
            <VStack flex="1" overflowY="auto" width="100%">
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
                        <Button colorScheme="blue" onClick={onOpen}>
                            Pair a New dApp
                        </Button>
                    </>
                )}
            </VStack>
            {/* Button at the bottom */}
            {sessions && !isEmpty(sessions) && (
                <Button onClick={onOpen} colorScheme="green300" w="100%">
                    Add Connection
                </Button>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add WalletConnect Connection</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Center flexDirection="column">
                            <Image src={wclogo} alt="WalletConnect Logo" mb={4} width="300px" />
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={handleChange}
                                placeholder="Enter WalletConnect URI"
                                size="md"
                                w="300px"
                            />
                        </Center>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handlePair}
                            disabled={!inputValue} // disable button if input is empty
                        >
                            Connect
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {ConnectionModal}
        </Flex>
    );
}
