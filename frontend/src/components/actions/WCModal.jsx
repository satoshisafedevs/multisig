/* eslint-disable react/forbid-prop-types */
import {
    Box,
    Button,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";

function WCModal({
    isOpen,
    onClose,
    onApproveConnection,
    modalType,
    transactionRequest,
    sessionProposal,
    onApproveTransaction,
}) {
    let modalContent;
    if (modalType === "transaction") {
        const transactionDetails = transactionRequest?.params?.request?.params[0];
        const metadata = transactionRequest?.verifyContext?.verified;
        modalContent = (
            <>
                <ModalHeader>Approve Transaction for {metadata?.origin || "dApp"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb="4">
                        <Image src="https://avatars.githubusercontent.com/u/37784886" alt="Dapp Icon" boxSize="50px" />
                        <Text>Description: {metadata?.origin || ""}</Text>
                    </Box>
                    <Box mb="4">
                        <Text fontWeight="bold">From:</Text>
                        <Text>{transactionDetails?.from}</Text>
                    </Box>
                    <Box mb="4">
                        <Text fontWeight="bold">To:</Text>
                        <Text>{transactionDetails?.to}</Text>
                    </Box>
                    <Box mb="4">
                        <Text fontWeight="bold">Amount:</Text>
                        <Text>{transactionDetails?.value}</Text>
                    </Box>
                    <Box mb="4">
                        <Text fontWeight="bold">Gas Fee:</Text>
                        <Text>{transactionDetails?.gas}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold">Data:</Text>
                        <Text>{transactionDetails?.data || "N/A"}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={onClose}>
                        Decline
                    </Button>
                    <Button colorScheme="green" onClick={onApproveTransaction}>
                        Approve
                    </Button>
                </ModalFooter>
            </>
        );
    }
    if (modalType === "connection") {
        const metadataConnection = sessionProposal?.params?.proposer?.metadata;
        modalContent = (
            <>
                <ModalHeader>Connect to {metadataConnection?.name || "Dapp"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{metadataConnection?.description || ""}</Text>
                    <Image
                        src={metadataConnection?.icons?.[0] || "https://avatars.githubusercontent.com/u/37784886"}
                        alt="Wallet Icon"
                        boxSize="50px"
                        my="4"
                    />
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blueSwatch" onClick={onApproveConnection}>
                        Approve
                    </Button>
                </ModalFooter>
            </>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>{modalContent}</ModalContent>
        </Modal>
    );
}

WCModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApproveConnection: PropTypes.func.isRequired,
    modalType: PropTypes.oneOf(["transaction", "connection"]).isRequired,
    transactionRequest: PropTypes.object,
    sessionProposal: PropTypes.object,
    onApproveTransaction: PropTypes.func,
};

export default WCModal;
