import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalFooter, Button } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function NoSubscriptionModal({ isOpen }) {
    const navigate = useNavigate();
    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent maxW="500px">
                <ModalHeader>Team subscription unavailable</ModalHeader>
                <ModalBody justifyItems="center">
                    To activate your team&apos;s subscription, please contact your team&apos;s owner.
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={() => navigate("/")}>
                        Go to team selector
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
NoSubscriptionModal.propTypes = {
    isOpen: PropTypes.bool,
};
