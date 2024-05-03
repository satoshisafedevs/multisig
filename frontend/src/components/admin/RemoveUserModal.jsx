import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Tag,
    useToast,
} from "@chakra-ui/react";
import { useUser } from "../../providers/User";
import { removeTeamUser } from "../../firebase";

function RemoveUserModal({ isOpen, setIsOpen, user, setUserToRemove }) {
    const { currentTeam, getUserTeamsData } = useUser();
    const toast = useToast();
    const cancelRef = useRef();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                cancelRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleRemoveUser = async (userData) => {
        try {
            setLoading(true);
            await removeTeamUser({ userId: userData.id, teamId: currentTeam.id });
            await getUserTeamsData();
            toast({
                description: `Successfully removed ${userData?.displayName || userData?.email} user.`,
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                description: `Failed to remove user ${userData?.displayName || userData?.email}. ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
            setIsOpen(false);
            setUserToRemove();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setIsOpen(false);
                setUserToRemove();
            }}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Remove user</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Are you sure you want to remove{" "}
                    <Tag fontSize="15px" colorScheme="red">
                        {user?.displayName || user?.email}
                    </Tag>
                    ?
                </ModalBody>

                <ModalFooter>
                    <Button
                        // stupid Chakra focus not working for button
                        _focus={{
                            boxShadow: "var(--chakra-shadows-outline)",
                        }}
                        ref={cancelRef}
                        mr={3}
                        onClick={() => {
                            setIsOpen(false);
                            setUserToRemove();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => handleRemoveUser(user)}
                        isLoading={loading}
                        loadingText="Removing..."
                    >
                        Remove
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

RemoveUserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    user: PropTypes.shape({
        displayName: PropTypes.string,
        email: PropTypes.string,
    }),
    setUserToRemove: PropTypes.func.isRequired,
};
export default RemoveUserModal;
