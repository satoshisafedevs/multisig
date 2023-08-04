import React from "react";
import { PropTypes } from "prop-types";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
    ModalFooter,
} from "@chakra-ui/react";
import SafeCard from "./admin/SafeCard";

export default function SafesModal({ isOpen, setIsOpen }) {
    const onClose = () => {
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader fontSize="lg" fontWeight="bold">
                    Safes
                </ModalHeader>
                <ModalBody>
                    <SafeCard />
                </ModalBody>
                <ModalFooter />
            </ModalContent>
        </Modal>
    );
}

SafesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};
