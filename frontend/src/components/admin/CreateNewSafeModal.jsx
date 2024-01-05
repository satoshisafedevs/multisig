import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    ModalHeader,
    ModalCloseButton,
    Td,
    ModalBody,
    Button,
    ModalFooter,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    IconButton,
    useToast,
    Spinner,
    Link,
} from "@chakra-ui/react";
import { IoChevronBackOutline, IoAdd, IoRemove } from "react-icons/io5";
import { useUser } from "../../providers/User";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import networks from "../../utils/networks.json";

function CreateNewSafeModal({ onClose, setModalState }) {
    const { teamUsersInfo } = useUser();
    const { createSafe } = useGnosisSafe();
    const toast = useToast();
    const [safeName, setSafeName] = useState("");
    const [network, setNetwork] = useState("");
    const [threshold, setThreshold] = useState("");
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [transactionHash, setTransactionHash] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initialize selectedOwners with all team members
    useEffect(() => {
        setSelectedOwners(Object.keys(teamUsersInfo));
        setThreshold(Math.min(1, Object.keys(teamUsersInfo).length));
    }, [teamUsersInfo]);

    const addOwner = () => {
        setSelectedOwners([...selectedOwners, ""]); // Add an empty value for a new selection
    };

    const updateOwner = (index, value) => {
        const newOwners = [...selectedOwners];
        newOwners[index] = value;
        setSelectedOwners(newOwners);
    };

    const removeOwner = (index) => {
        const newOwners = selectedOwners.filter((_, i) => i !== index);
        setSelectedOwners(newOwners);
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
                <ModalHeader>Create New Safe</ModalHeader>
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
            <ModalHeader>Create New Safe</ModalHeader>
            <ModalCloseButton top="var(--chakra-space-3)" />
            <ModalBody paddingTop="0">
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={safeName} onChange={(e) => setSafeName(e.target.value)} />
                </FormControl>

                <FormControl mt={4}>
                    <FormLabel>Network</FormLabel>
                    <Select placeholder="Select network" value={network} onChange={(e) => setNetwork(e.target.value)}>
                        {Object.entries(networks).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value.metamaskSettings.chainName}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl mt={4}>
                    <FormLabel>Owners</FormLabel>
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Owner</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {selectedOwners.map((ownerId, index) => (
                                <Tr key={ownerId}>
                                    <Td>
                                        <Select
                                            placeholder="Select team member"
                                            value={ownerId}
                                            onChange={(e) => updateOwner(index, e.target.value)}
                                            flex="1"
                                        >
                                            {Object.entries(teamUsersInfo).map(([id, { displayName }]) => (
                                                <option key={id} value={id}>
                                                    {displayName}
                                                </option>
                                            ))}
                                        </Select>
                                    </Td>
                                    <Td>
                                        <IconButton
                                            aria-label="Remove owner"
                                            icon={<IoRemove />}
                                            onClick={() => removeOwner(index)}
                                            ml={2}
                                        />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                    <Button mt={2} leftIcon={<IoAdd />} onClick={addOwner}>
                        Add Owner
                    </Button>
                </FormControl>

                <FormControl mt={4}>
                    <FormLabel>Threshold</FormLabel>
                    <Select
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        placeholder="Select threshold"
                        isDisabled={selectedOwners.length === 0}
                    >
                        {Array.from({ length: selectedOwners.length }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </Select>
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
                    <Button colorScheme="green300" onClick={handleCreateSafe}>
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
