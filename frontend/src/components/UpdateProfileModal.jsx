import React, { useEffect, useState, useRef } from "react";
import { PropTypes } from "prop-types";
import {
    Button,
    Box,
    Input,
    InputGroup,
    InputLeftAddon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { IoSave } from "react-icons/io5";
import { db, doc, updateDoc } from "../firebase";
import { useUser } from "../providers/User";
import useAuth from "../hooks/useAuth";

export default function UpdateProfileModal({ isOpen, setIsOpen }) {
    const toast = useToast();
    const { user, firestoreUser, setFirestoreUser, currentTeam, userTeamData, setTeamUsersInfo } = useUser();
    const { updateUserData } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [team, setTeam] = useState("");
    const [userWalletAddress, setUserWalletAddress] = useState("");
    const [saving, setSaving] = useState(false);
    const firstInput = useRef();

    const onClose = () => setIsOpen(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                firstInput.current.focus();
            }, 0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (firestoreUser?.displayName) {
            setDisplayName(firestoreUser.displayName);
        }
        if (currentTeam?.name) {
            setTeam(currentTeam.name);
        }
        if (userTeamData?.userWalletAddress) {
            setUserWalletAddress(userTeamData.userWalletAddress);
        }
    }, [firestoreUser, currentTeam, userTeamData]);

    const handleDisplayName = (event) => setDisplayName(event.target.value);

    const handleTeam = (event) => setTeam(event.target.value.replaceAll(" ", ""));

    const handleUserWalletAddress = (event) => setUserWalletAddress(event.target.value.replaceAll(" ", ""));

    const handleSave = async () => {
        setSaving(true);
        try {
            const trimmedDisplayName = displayName.trim();
            await updateUserData(user, { displayName: trimmedDisplayName });
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { displayName: trimmedDisplayName });
            setFirestoreUser((prevState) => ({ ...prevState, displayName: trimmedDisplayName }));
            setTeamUsersInfo((prevState) => ({
                ...prevState,
                [user.uid]: trimmedDisplayName.length > 0 ? trimmedDisplayName : user.email,
            }));
            setSaving(false);
            setIsOpen(false);
            setDisplayName("");
            setTeam("");
            setUserWalletAddress("");
        } catch (error) {
            toast({
                description: `User profile update error: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader>Update your profile</ModalHeader>
                <ModalBody>
                    <Box width="100%">
                        <Stack direction="row" align="center" paddingBottom="20px">
                            <InputGroup>
                                <InputLeftAddon width="150px">Name</InputLeftAddon>
                                <Input value={displayName} onChange={handleDisplayName} ref={firstInput} />
                            </InputGroup>
                        </Stack>
                        <Stack direction="row" align="center" paddingBottom="20px">
                            <InputGroup>
                                <InputLeftAddon width="150px">Team name</InputLeftAddon>
                                <Input value={team} onChange={handleTeam} disabled />
                            </InputGroup>
                        </Stack>
                        <Stack direction="row" align="center">
                            <InputGroup>
                                <InputLeftAddon width="150px">Wallet address</InputLeftAddon>
                                <Input
                                    value={userWalletAddress}
                                    onChange={handleUserWalletAddress}
                                    placeholder="active MetaMask address"
                                    disabled
                                />
                            </InputGroup>
                        </Stack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Stack direction="row" spacing={4}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            colorScheme="blueSwatch"
                            rightIcon={<IoSave size="20px" />}
                            isDisabled={displayName.length === 0 || userWalletAddress.length === 0}
                            isLoading={saving}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </Stack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

UpdateProfileModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};
