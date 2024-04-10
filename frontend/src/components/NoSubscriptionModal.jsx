import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalFooter } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";

export default function NoSubscriptionModal({ isOpen }) {
    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent maxW="500px">
                <ModalHeader>Team Subscription Unavailable</ModalHeader>
                <ModalBody justifyItems="center">
                    To activate your team&apos;s subscription, please reach out to your team&apos;s owner.
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}
NoSubscriptionModal.propTypes = {
    isOpen: PropTypes.bool,
};
