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
import useAuth from "../hooks/useAuth";
import { useFirestoreUser } from "../providers/FirestoreUser";

export default function CompleteProfileModal() {
    const toast = useToast();
    const { firestoreUser, setFirestoreUser } = useFirestoreUser();
    const { db, doc, getDoc, user, updateProfile, updateDoc } = useAuth();
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState("");
    const [team, setTeam] = useState("");
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [saving, setSaving] = useState(false);

    let intervalId;

    const checkAuthorization = async () => {
        // Check if user is authorized for the chat room in teams collection
        const docRef = doc(db, "teams", team);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await user.reload();
            clearInterval(intervalId);
            setSaving(false);
            setProfileCompleted(true);
            setFirestoreUser({ ...firestoreUser, displayName, team });
        }
    };

    useEffect(() => {
        if (firestoreUser && Object.keys(firestoreUser).length !== 0) {
            if (!("displayName" in firestoreUser) || !("team" in firestoreUser)) {
                if ("displayName" in firestoreUser) {
                    setDisplayName(user.displayName);
                }
                if ("team" in firestoreUser) {
                    setTeam(firestoreUser.team);
                }
                setLoading(false);
                setProfileCompleted(false);
                return;
            }
            setLoading(false);
            setProfileCompleted(true);
        }
    }, [firestoreUser]);

    const handleDisplayName = (event) => setDisplayName(event.target.value);

    const handleTeam = (event) => setTeam(event.target.value.replaceAll(" ", ""));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user, { displayName });
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                displayName,
                team,
            });
            intervalId = setInterval(() => checkAuthorization(), 1000);
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
                        profile and create your first team.
                    </Box>
                    <Box width="100%">
                        <Stack direction="row" align="center" padding="20px 0">
                            <InputGroup>
                                <InputLeftAddon width="120px">* Name</InputLeftAddon>
                                <Input value={displayName} onChange={handleDisplayName} />
                            </InputGroup>
                        </Stack>
                        <Stack direction="row" align="center">
                            <InputGroup>
                                <InputLeftAddon width="120px">* Team</InputLeftAddon>
                                <Input value={team} onChange={handleTeam} />
                            </InputGroup>
                        </Stack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="green300"
                        rightIcon={<IoSave size="20px" />}
                        isDisabled={displayName.length === 0 || team.length === 0}
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
