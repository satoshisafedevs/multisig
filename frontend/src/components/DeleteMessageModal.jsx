import React, { useRef } from "react";
import { PropTypes } from "prop-types";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
} from "@chakra-ui/react";
import useAuth from "../hooks/useAuth";

export default function DeleteMessageModal({ messageID, isOpen, setIsOpen, setHoverID }) {
    const { deleteMessage } = useAuth();
    const cancelRef = useRef();

    const onClose = () => {
        setIsOpen(false);
        setHoverID(null);
    };

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} isCentered>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete message
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        Are you sure you want to delete this message? This cannot be undone.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
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
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

DeleteMessageModal.propTypes = {
    messageID: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    setHoverID: PropTypes.func.isRequired,
};
