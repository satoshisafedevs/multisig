import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { ethers } from "ethers";
import { upperFirst } from "lodash";
import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Input,
    Button,
    Tag,
} from "@chakra-ui/react";
import { IoPersonAdd } from "react-icons/io5";
import { useWagmi } from "../../providers/Wagmi";
import useGnosisSafe from "../../hooks/useGnosisSafe";

function AddSafeOwnerModal({
    isOpen,
    setIsOpen,
    safeAddress,
    safeName,
    owners,
    threshold,
    network,
    fetchAndUpdateLatestSafesData,
}) {
    const { chain, metaMaskInstalled } = useWagmi();
    const { addSafeOwner } = useGnosisSafe();
    const [newOwner, setNewOwner] = useState("");
    const [newThreshold, setNewThreshold] = useState(threshold);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setNewThreshold(threshold);
    };

    const networkMismatch = chain && chain.network !== network;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add safe owner</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Add owner to safe{" "}
                    <Tag fontSize="15px" colorScheme="green300">
                        {safeName || safeAddress}
                    </Tag>
                    <Input
                        marginTop="10px"
                        ref={inputRef}
                        placeholder="New owner wallet address"
                        onChange={(event) => setNewOwner(event.target.value)}
                        isDisabled={loading}
                    />
                    <Box display="flex" flexDirection="row" alignItems="center" paddingTop="10px">
                        Threshold{" "}
                        <NumberInput
                            paddingLeft="5px"
                            size="md"
                            maxW={20}
                            defaultValue={newThreshold}
                            min={1}
                            max={(owners && owners.length + 1) || 1}
                            onChange={(valueString) => setNewThreshold(valueString)}
                            isDisabled={loading}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme={networkMismatch ? "orange" : "green300"}
                        rightIcon={<IoPersonAdd />}
                        isDisabled={
                            !ethers.utils.isAddress(newOwner) || !newThreshold || networkMismatch || !metaMaskInstalled
                        }
                        isLoading={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const resp = await addSafeOwner(safeAddress, {
                                    ownerAddress: newOwner,
                                    threshold: newThreshold,
                                });
                                if (resp) {
                                    setTimeout(() => {
                                        const controller = new AbortController();
                                        fetchAndUpdateLatestSafesData(controller);
                                    }, 10000);
                                }
                            } finally {
                                onClose();
                                setLoading(false);
                            }
                        }}
                    >
                        {networkMismatch
                            ? `Switch to ${upperFirst(network)} network`
                            : "Execute transaction to add owner"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

AddSafeOwnerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    safeAddress: PropTypes.string.isRequired,
    safeName: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.string),
    threshold: PropTypes.number.isRequired,
    network: PropTypes.string.isRequired,
    fetchAndUpdateLatestSafesData: PropTypes.func.isRequired,
};

export default AddSafeOwnerModal;
