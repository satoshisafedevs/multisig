import React, { useState, useEffect } from "react";
import {
    Input,
    Image,
    Center,
    Button,
    useToast,
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
import wclogo from "../../img/walletconnect_logo.png";
import useWalletConnect from "../../hooks/useWalletConnect";

export default function WalletConnect() {
    const { pair, createWeb3Wallet, ConnectionModal, disconnect, sessions } = useWalletConnect();
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        createWeb3Wallet();
    }, []);

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
        <VStack align="start" p={4}>
            <Button onClick={onOpen} colorScheme="green300" position="absolute" top="30px" right="30px">
                Add Connection
            </Button>
            <Heading size="sm" mt="20px">
                Paired dApps
            </Heading>

            {sessions &&
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
                })}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Wallet Connect Connection</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Center flexDirection="column">
                            <Image src={wclogo} alt="WalletConnect Logo" mb={4} width="300px" />
                            <Input
                                value={inputValue}
                                onChange={handleChange}
                                placeholder="Enter WalletConnect URI"
                                size="md"
                                w="300px"
                            />
                        </Center>
                    </ModalBody>
                    <ModalFooter>
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
        </VStack>
    );
}