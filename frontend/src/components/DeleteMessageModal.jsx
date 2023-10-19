import React, { useRef, useCallback, useEffect } from "react";
import { PropTypes } from "prop-types";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
    ModalFooter,
    Button,
    useToast,
} from "@chakra-ui/react";
import { db, doc, deleteDoc } from "../firebase";
import { useUser } from "../providers/User";

export default function DeleteMessageModal({ messageID, isOpen, setIsOpen, setHoverID }) {
    const { currentTeam } = useUser();
    const toast = useToast();
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
        setHoverID(null);
    };

    const deleteMessage = useCallback(
        async (id) => {
            try {
                const docRef = doc(db, "teams", currentTeam.id, "messages", id);
                await deleteDoc(docRef);
            } catch (error) {
                toast({
                    description: `Failed to delete message: ${error.message}`,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [currentTeam?.id],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader fontSize="lg" fontWeight="bold">
                    Delete message
                </ModalHeader>
                <ModalBody>Are you sure you want to delete this message? This cannot be undone.</ModalBody>
                <ModalFooter>
                    <Button
                        _focus={{
                            boxShadow: "var(--chakra-shadows-outline)", // stupid Chakra focus not working for button
                        }}
                        ref={cancelRef}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => {
                            deleteMessage(messageID);
                            onClose();
                        }}
                        ml={3}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

DeleteMessageModal.propTypes = {
    messageID: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    setHoverID: PropTypes.func.isRequired,
};
