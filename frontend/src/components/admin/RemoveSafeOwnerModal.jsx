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
import { IoPersonRemove } from "react-icons/io5";
import { useWagmi } from "../../providers/Wagmi";
import useGnosisSafe from "../../hooks/useGnosisSafe";

function RemoveSafeOwnerModal({
    isOpen,
    setIsOpen,
    owner,
    owners,
    threshold,
    safeAddress,
    safeName,
    network,
    fetchAndUpdateLatestSafesData,
}) {
    const { chain, metaMaskInstalled } = useWagmi();
    const { removeSafeOwner } = useGnosisSafe();

    let updatedThreshold = 1;

    if (threshold && owners) {
        if (threshold === owners.length) {
            updatedThreshold = threshold - 1;
            return;
        }
        updatedThreshold = threshold;
    }

    const [newThreshold, setNewThreshold] = useState(updatedThreshold);
    const [loading, setLoading] = useState(false);
    const cancelRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                cancelRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setNewThreshold(updatedThreshold);
    };

    const networkMismatch = chain && chain.network !== network;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Remove safe owner</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Are you sure you want to remove owner{" "}
                    <Tag fontSize="15px" colorScheme="red">
                        {owner}
                    </Tag>{" "}
                    <br />
                    from safe <Tag fontSize="15px">{safeName || safeAddress}</Tag>?
                    {owners && owners.length - 1 > 1 && (
                        <Box display="flex" flexDirection="row" alignItems="center" paddingTop="10px">
                            Threshold
                            <NumberInput
                                paddingLeft="5px"
                                size="md"
                                maxW={20}
                                defaultValue={updatedThreshold}
                                min={1}
                                max={owners.length - 1}
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
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        mr={3}
                        _focus={{
                            boxShadow: "var(--chakra-shadows-outline)",
                            // stupid Chakra outline not working for button on focus
                        }}
                        ref={cancelRef}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme={networkMismatch ? "orange" : "red"}
                        rightIcon={<IoPersonRemove />}
                        isDisabled={!newThreshold || networkMismatch || !metaMaskInstalled}
                        isLoading={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const resp = await removeSafeOwner(safeAddress, {
                                    ownerAddress: owner,
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
                            : "Execute transaction to remove owner"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

RemoveSafeOwnerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    owner: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.string),
    threshold: PropTypes.number,
    safeAddress: PropTypes.string.isRequired,
    safeName: PropTypes.string,
    network: PropTypes.string.isRequired,
    fetchAndUpdateLatestSafesData: PropTypes.func.isRequired,
};

export default RemoveSafeOwnerModal;
