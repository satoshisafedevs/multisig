import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import {
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Button,
    ModalFooter,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Tooltip,
    IconButton,
    useToast,
    Spinner,
    Link,
    Box,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import { IoChevronBackOutline, IoChevronDown, IoPersonRemove } from "react-icons/io5";
import { useUser } from "../../providers/User";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import networks from "../../utils/networks.json";

let joinedNetowrks = networks;

if (import.meta.env.MODE === "development") {
    const sepolia = {
        sepolia: {
            url: "https://rpc.sepolia.dev",
            svg: "/networks/mainnet.svg",
            safeTransactionService: "https://safe-transaction-sepolia.safe.global",
            id: 11155111,
            currency: "SepoliaETH",
            title: "Sepolia Testnet",
            scanUrl: "https://sepolia.etherscan.io",
            metamaskSettings: {
                chainId: "0xAA36A7",
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                    name: "Ether",
                    symbol: "SepoliaETH",
                    decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.dev"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
        },
    };
    joinedNetowrks = { ...joinedNetowrks, ...sepolia };
}

function CreateNewSafeModal({ onClose, setModalState }) {
    const { teamUsersInfo } = useUser();
    const { createSafe } = useGnosisSafe();
    const toast = useToast();
    const [safeName, setSafeName] = useState("");
    const [network, setNetwork] = useState("");
    const [threshold, setThreshold] = useState(1);
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [transactionHash, setTransactionHash] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initialize selectedOwners with all team members
    useEffect(() => {
        setSelectedOwners(Object.keys(teamUsersInfo));
        setThreshold(Object.keys(teamUsersInfo).length);
    }, [teamUsersInfo]);

    const removeOwner = (index) => {
        const newOwners = selectedOwners.filter((_, i) => i !== index).filter((owner) => owner !== "");
        setSelectedOwners(newOwners);
        if (threshold > 1 && threshold > newOwners.length) {
            setThreshold((prevState) => prevState - 1);
        }
    };

    const handleCreateSafe = async () => {
        if (!safeName || !network) {
            toast({
                title: "Required Fields Missing",
                description: "Please fill in all required fields.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const ownerAddresses = selectedOwners.map((ownerId) => teamUsersInfo[ownerId].walletAddress);
        try {
            await createSafe({
                network,
                owners: ownerAddresses,
                threshold,
                onTransactionSent: (txHash) => {
                    setTransactionHash(txHash);
                    setIsLoading(false);
                    toast({
                        title: "Transaction Sent",
                        description: `Transaction has been sent.
                        View on [block explorer](${networks[network].scanUrl}/tx/${txHash})`,
                        status: "info",
                        duration: 9000,
                        isClosable: true,
                    });
                },
            });
        } catch (error) {
            toast({
                title: "Error creating safe",
                description: error,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
        console.log({ safeName, network, ownerAddresses });
        onClose();
    };

    if (isLoading) {
        return (
            <>
                <ModalHeader>Create new Safe</ModalHeader>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalBody>
                    <Spinner />
                    {transactionHash ? (
                        <Link href={`https://etherscan.io/tx/${transactionHash}`} isExternal>
                            View Transaction
                        </Link>
                    ) : (
                        <p>Creating Safe...</p>
                    )}
                </ModalBody>
                <ModalFooter justifyContent="space-between">
                    <Stack direction="row" spacing={4}>
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </Stack>
                </ModalFooter>
            </>
        );
    }

    return (
        <>
            <ModalHeader>Create new Safe</ModalHeader>
            <ModalCloseButton top="var(--chakra-space-3)" />
            <ModalBody paddingTop="0">
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={safeName} onChange={(e) => setSafeName(e.target.value)} />
                </FormControl>

                <FormControl mt={4}>
                    <FormLabel>Network</FormLabel>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<IoChevronDown />}>
                            {(network && joinedNetowrks[network].metamaskSettings.chainName) || "Select network"}
                        </MenuButton>
                        <MenuList>
                            {Object.entries(joinedNetowrks).map(([key, value]) => (
                                <MenuItem key={key} value={key} onClick={() => setNetwork(key)}>
                                    {value.metamaskSettings.chainName}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Owners</FormLabel>
                    <Box paddingLeft="15px" paddingBottom="10px">
                        {selectedOwners.length > 0 &&
                            selectedOwners.map((ownerId, index) => (
                                <Box display="flex" flexDirection="row" alignItems="center" key={ownerId}>
                                    <Box>{teamUsersInfo[ownerId].displayName || teamUsersInfo[ownerId].email}</Box>
                                    <Box>
                                        <Tooltip label="Remove owner">
                                            <IconButton
                                                variant="ghost"
                                                aria-label="Remove owner"
                                                icon={<IoPersonRemove />}
                                                onClick={() => removeOwner(index)}
                                                ml={2}
                                            />
                                        </Tooltip>
                                    </Box>
                                </Box>
                            ))}
                    </Box>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<IoChevronDown />}
                            isDisabled={selectedOwners.length >= Object.keys(teamUsersInfo).length}
                        >
                            Add owner
                        </MenuButton>
                        <MenuList>
                            {Object.entries(teamUsersInfo)
                                .filter(([key]) => !selectedOwners.includes(key))
                                .map(([id, { displayName, email }]) => (
                                    <MenuItem
                                        key={id}
                                        value={id}
                                        onClick={() => setSelectedOwners((prevState) => [...prevState, id])}
                                    >
                                        {displayName || email}
                                    </MenuItem>
                                ))}
                        </MenuList>
                    </Menu>
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel>Threshold</FormLabel>
                    <Box display="flex" flexDirection="row" alignItems="center" paddingTop="10px">
                        <NumberInput
                            size="md"
                            maxW={20}
                            defaultValue={threshold}
                            min={1}
                            max={selectedOwners.length || 1}
                            onChange={(value) => setThreshold(value)}
                            value={threshold}
                            // isDisabled={loading}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>
                </FormControl>
            </ModalBody>
            <ModalFooter justifyContent="space-between">
                <Button
                    leftIcon={<IoChevronBackOutline size="18px" margin="0" />}
                    onClick={() => setModalState("welcome")}
                >
                    Back
                </Button>
                <Stack direction="row" spacing={4}>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green300"
                        onClick={handleCreateSafe}
                        isDisabled={!safeName || !network || threshold === 0 || isEmpty(selectedOwners)}
                    >
                        Create Safe
                    </Button>
                </Stack>
            </ModalFooter>
        </>
    );
}

CreateNewSafeModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    setModalState: PropTypes.func.isRequired,
};

export default CreateNewSafeModal;
