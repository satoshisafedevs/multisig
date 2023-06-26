import React, { useEffect, useState } from "react";
import {
    Button,
    Box,
    Input,
    InputGroup,
    InputLeftAddon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { IoSave } from "react-icons/io5";
import { db, doc } from "../firebase";
import useAuth from "../hooks/useAuth";
import { useUser } from "../providers/User";

export default function CompleteProfileModal() {
    const toast = useToast();
    const { user, firestoreUser } = useUser();
    const { updateProfile, updateDoc } = useAuth();
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("");
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (firestoreUser && Object.keys(firestoreUser).length !== 0) {
            if (!("displayName" in firestoreUser)) {
                setLoading(false);
                setProfileCompleted(false);
                return;
            }
            setDisplayName(firestoreUser.displayName);

            setLoading(false);
            setProfileCompleted(true);
        }
    }, [firestoreUser]);

    const handleDisplayName = (event) => setDisplayName(event.target.value);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user, { displayName });
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                displayName,
            });
            setSaving(false);
            setProfileCompleted(true);
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
        <Modal isOpen={!loading && !profileCompleted} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Welocome to Satoshi Safe</ModalHeader>
                <ModalBody>
                    <Box>
                        Welcome to Satoshi Safe, your new operation center for DeFi. Let&apos;s add your name to your
                        profile.
                    </Box>
                    <Box width="100%">
                        <Stack direction="row" align="center" padding="20px 0">
                            <InputGroup>
                                <InputLeftAddon width="120px">* Name</InputLeftAddon>
                                <Input value={displayName} onChange={handleDisplayName} />
                            </InputGroup>
                        </Stack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="green300"
                        rightIcon={<IoSave size="20px" />}
                        isDisabled={displayName.length === 0}
                        isLoading={saving}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
