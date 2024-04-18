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
    const { address, chain, chains, metaMaskInstalled, switchNetwork, walletMismatch } = useWagmi();
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
        setNewOwner("");
    };

    const networkMismatch =
        chain && (network === "mainnet" ? chain.network !== "homestead" : chain.network !== network);

    const satoshiData = {
        type: "addSafeOwner",
        owner: newOwner,
        oldThreshold: threshold,
        newThreshold,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add safe owner</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Add owner to safe{" "}
                    <Tag fontSize="15px" colorScheme="blueSwatch">
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
                        colorScheme={networkMismatch ? "bronzeSwatch" : "blueSwatch"}
                        rightIcon={<IoPersonAdd />}
                        isDisabled={
                            !ethers.utils.isAddress(newOwner) ||
                            !newThreshold ||
                            !metaMaskInstalled ||
                            !address ||
                            walletMismatch
                        }
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
                                switchNetwork(correctChain.id);
                            } else {
                                try {
                                    setLoading(true);
                                    const resp = await addSafeOwner(
                                        network,
                                        safeAddress,
                                        {
                                            ownerAddress: newOwner,
                                            threshold: newThreshold,
                                        },
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
                            : "Create and sign transaction to add owner"}
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
