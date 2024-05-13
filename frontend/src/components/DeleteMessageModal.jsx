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
import {
    db,
    doc,
    deleteDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    writeBatch,
} from "../firebase";
import { useUser } from "../providers/User";

export default function DeleteMessageModal({ messageID, isOpen, setIsOpen, setHoverID, thread, parentMessageID }) {
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

    // Function to delete an entire subcollection in a batch, with a pre-check for existence
    async function deleteSubcollectionInBatch(parentDocRef, subcollectionName) {
        const subCollectionRef = collection(parentDocRef, subcollectionName);

        // Query the subcollection to see if any documents exist
        const subCollectionSnapshot = await getDocs(subCollectionRef);

        if (subCollectionSnapshot.empty) return;

        // Initialize the batch
        const batch = writeBatch(db);

        // Add delete operations for each document to the batch
        subCollectionSnapshot.forEach((docSnapshot) => batch.delete(docSnapshot.ref));

        // Commit the batch deletion
        await batch.commit();
    }

    const deleteMessage = useCallback(
        async (id) => {
            try {
                let docRef;
                if (thread) {
                    docRef = doc(db, "teams", currentTeam.id, "messages", parentMessageID, "thread", id);
                } else {
                    docRef = doc(db, "teams", currentTeam.id, "messages", id);
                    await deleteSubcollectionInBatch(docRef, "thread");
                }
                await deleteDoc(docRef);
                if (thread) {
                    const messagesRef = collection(db, "teams", currentTeam.id, "messages", parentMessageID, "thread");
                    const querySnapshot = await getDocs(query(messagesRef, orderBy("createdAt", "desc"), limit(1)));
                    if (querySnapshot.docs.length > 0) {
                        const latestMessageData = querySnapshot.docs[0].data();
                        const messageDoc = doc(db, "teams", currentTeam.id, "messages", parentMessageID);
                        const messageSnap = await getDoc(messageDoc);
                        const newThreadCount = (messageSnap.data().threadCount || 1) - 1;
                        await updateDoc(messageDoc, {
                            threadCount: newThreadCount,
                            threadLastReply: latestMessageData.createdAt,
                        });
                    } else {
                        const messageDoc = doc(db, "teams", currentTeam.id, "messages", parentMessageID);
                        await updateDoc(messageDoc, {
                            threadCount: 0,
                            threadLastReply: null,
                        });
                    }
                }
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
    thread: PropTypes.bool,
    parentMessageID: PropTypes.string,
};
