import React, { useState, useEffect, useRef } from "react";
import {
    Box,
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
    useColorModeValue,
    Heading,
    Text,
} from "@chakra-ui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { isEmpty } from "lodash";
import wclogo from "../../img/walletconnect_logo.png";
import { useWalletConnect } from "../../providers/WalletConnect";
import { useUser } from "../../providers/User";
import networks from "../../utils/networks.json";

export default function WalletConnect() {
    const { pair, createWeb3Wallet, ConnectionModal, disconnect, sessions, selectedSafes, setSelectedSafes } =
        useWalletConnect();
    const { safes } = useUser();
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const inputRef = useRef();
    const bg = useColorModeValue("gray.100", "gray.700");
    const selectedBg = useColorModeValue("green.200", "green.700");

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

    const closeModal = () => {
        setInputValue("");
        setSelectedSafes([]);
        onClose();
    };

    const toggleSafeSelection = (safeAddress) => {
        const newSelectedSafeList = selectedSafes.includes(safeAddress)
            ? selectedSafes.filter((s) => s !== safeAddress)
            : [...selectedSafes, safeAddress];
        setSelectedSafes(newSelectedSafeList);
    };
    const handlePair = async () => {
        if (selectedSafes.length === 0) {
            // Check if no safes are selected
            toast({
                title: "No Safes Selected",
                description: "Please select at least one safe to pair.",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return; // Stop the function if no safes are selected
        }

        if (!inputValue) {
            toast({
                title: "No URI Entered",
                description: "Please enter a WalletConnect URI.",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return; // Stop the function if no URI is entered
        }

        try {
            await pair({ uri: inputValue });
            // Assuming you want to do something with the selected safes here.
            // ...
            setInputValue(""); // Reset input value after successful pairing
            onClose(); // Close the modal on successful pairing
        } catch (error) {
            toast({
                description: `WalletConnect Pairing Error: ${error.message}`,
                position: "top",
                status: "error",
                isClosable: true,
            });
        }
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

            <Modal isOpen={isOpen} onClose={closeModal}>
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
                        <>
                            <Heading size="sm" mt="20px">
                                Safe(s) to Pair
                            </Heading>
                            <Flex wrap="wrap" justify="space-around" align="center">
                                {safes.map((safe) => (
                                    <Box
                                        key={safe.safeAddress}
                                        p={4}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-start" // Align items to the start of the box
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        m={2}
                                        bg={selectedSafes.includes(safe.safeAddress) ? selectedBg : bg}
                                        cursor="pointer"
                                        onClick={() => toggleSafeSelection(safe.safeAddress)}
                                        width="180px" // Set a fixed width to accommodate the content
                                    >
                                        <Image src={networks[safe.network].svg} boxSize="24px" mr={2} />
                                        <Text fontSize="sm" isTruncated>
                                            {safe.name || safe.safeAddress}
                                        </Text>
                                    </Box>
                                ))}
                            </Flex>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button mr={3} onClick={handlePair} colorScheme="blue">
                            Connect
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {ConnectionModal}
        </Flex>
    );
}
