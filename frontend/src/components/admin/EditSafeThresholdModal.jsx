import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
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
    Button,
    Tag,
} from "@chakra-ui/react";
import { IoCogOutline } from "react-icons/io5";
import { useWagmi } from "../../providers/Wagmi";
import useGnosisSafe from "../../hooks/useGnosisSafe";

function EditSafeThresholdModal({
    isOpen,
    setIsOpen,
    safeAddress,
    safeName,
    owners,
    threshold,
    network,
    fetchAndUpdateLatestSafesData,
}) {
    const { address, chain, chains, metaMaskInstalled, switchNetworkAsync, walletMismatch } = useWagmi();
    const { editSafeThreshold } = useGnosisSafe();
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

    const networkMismatch =
        chain && (network === "mainnet" ? chain.network !== "homestead" : chain.network !== network);

    const satoshiData = {
        type: "editSafeThreshold",
        newThreshold,
        oldThreshold: threshold,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit safe threshold</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Edit threshold for safe{" "}
                    <Tag fontSize="15px" colorScheme="blueSwatch">
                        {safeName || safeAddress}
                    </Tag>
                    <Box display="flex" flexDirection="row" alignItems="center" paddingTop="10px">
                        <NumberInput
                            size="md"
                            maxW={20}
                            defaultValue={newThreshold}
                            min={1}
                            max={(owners && owners.length) || 1}
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
                        colorScheme={networkMismatch ? "bronzeSwatch" : "blueSwatch"}
                        rightIcon={<IoCogOutline />}
                        isDisabled={!newThreshold || !metaMaskInstalled || !address || walletMismatch}
                        isLoading={loading}
                        onClick={async () => {
                            if (networkMismatch) {
                                const correctChain = chains.find((el) => {
                                    // Check if the network is 'mainnet' and the el.network is 'homestead'
                                    if (network === "mainnet") {
                                        return el.network === "homestead";
                                    }
                                    // For other networks, just match the el.network with the given network
                                    return el.network === network;
                                });
                                try {
                                    setLoading(true);
                                    await switchNetworkAsync(correctChain.id);
                                } finally {
                                    setLoading(false);
                                }
                            } else {
                                try {
                                    setLoading(true);
                                    const resp = await editSafeThreshold(
                                        network,
                                        safeAddress,
                                        newThreshold,
                                        address,
                                        satoshiData,
                                    );
                                    if (resp) {
                                        setTimeout(() => {
                                            fetchAndUpdateLatestSafesData();
                                        }, 10000);
                                    }
                                } finally {
                                    onClose();
                                    setLoading(false);
                                }
                            }
                        }}
                    >
                        {networkMismatch
                            ? `Switch to ${upperFirst(network)} network`
                            : "Create and sign transaction to edit threshold"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

EditSafeThresholdModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    safeAddress: PropTypes.string.isRequired,
    safeName: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.string),
    threshold: PropTypes.number.isRequired,
    network: PropTypes.string.isRequired,
    fetchAndUpdateLatestSafesData: PropTypes.func.isRequired,
};

export default EditSafeThresholdModal;
