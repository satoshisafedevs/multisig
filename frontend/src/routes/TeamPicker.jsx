import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Text,
    VStack,
    Button,
    Container,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    useDisclosure,
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useFirestoreUser } from "../providers/FirestoreUser";
import useAuth from "../hooks/useAuth";

function TeamPicker() {
    const { firestoreUser, teamData } = useFirestoreUser();
    const { db, addDoc, collection, setDoc, doc } = useAuth();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [teamName, setTeamName] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const handleTeamSelect = (slug) => {
        navigate(`/team/${slug}`);
    };

    const handleNewTeamSubmit = async () => {
        const newTeamData = {
            name: teamName,
            users: [firestoreUser.uid],
            // generate a slug from the team name
            slug: `${teamName.toLowerCase().replace(/\s+/g, "-")}-${Math.floor(Math.random() * 1000)}`,
        };
        const newDoc = await addDoc(collection(db, "teams"), newTeamData);
        const teamRef = doc(db, "users", firestoreUser.uid, "teams", newDoc.id);
        await setDoc(
            teamRef,
            {
                userWalletAddress: walletAddress,
            },
            { merge: true },
        );
        setTeamName("");
        setWalletAddress("");
        onClose();
        handleTeamSelect(newTeamData.slug);
    };

    return (
        <Container maxW="container.lg" py={5}>
            <Text fontSize="2xl" mb={5}>
                Select your team
            </Text>
            <VStack
                spacing={4}
                align="stretch"
                overflowY="auto"
                maxHeight="80vh"
                padding={5}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
            >
                {Array.isArray(teamData) &&
                    teamData.map((team) => (
                        <Button key={team.id} onClick={() => handleTeamSelect(team.slug)}>
                            {team.name}
                        </Button>
                    ))}
                <Button leftIcon={<IoAdd />} colorScheme="green300" onClick={onOpen}>
                    Create new team
                </Button>
            </VStack>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create new team</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Team name</FormLabel>
                            <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Wallet address</FormLabel>
                            <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="green300" mr={3} onClick={handleNewTeamSubmit}>
                            Create
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default TeamPicker;
