import React from "react";
import PropTypes from "prop-types";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Image,
} from "@chakra-ui/react";

function ConnectionModal({ isOpen, onClose, sessionProposal, onApprove }) {
    const metadata = sessionProposal?.params?.proposer?.metadata;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Connect to Wallet</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{metadata?.name || "Dapp Name"}</Text>
                    <Text>{metadata?.description || "Dapp Description"}</Text>
                    <Image
                        src={metadata?.icons?.[0] || "https://avatars.githubusercontent.com/u/37784886"}
                        alt="Wallet Icon"
                        boxSize="50px"
                        my="4"
                    />
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={onApprove}>
                        Approve
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

ConnectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApprove: PropTypes.func.isRequired,
    sessionProposal: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        icons: PropTypes.arrayOf(PropTypes.string),
        params: PropTypes.shape({
            proposer: PropTypes.shape({
                // eslint-disable-next-line react/forbid-prop-types
                metadata: PropTypes.object,
            }),
        }),
    }),
};

export default ConnectionModal;
