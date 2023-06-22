import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Heading,
    Card,
    Spinner,
    Stack,
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
        <Container align="center" margin="auto" height="80vh">
            <Heading fontSize="2xl" mb={5}>
                Select your team
            </Heading>
            <Card padding={5}>
                <Stack direction="column" align="stretch" spacing={4}>
                    {!teamData && (
                        <Spinner
                            color="blue.500"
                            speed="1s"
                            size="md"
                            thickness="2px"
                            emptyColor="gray.200"
                            margin="auto"
                            paddingBottom={15}
                        />
                    )}
                    {Array.isArray(teamData) &&
                        teamData.map((team) => (
                            <Button key={team.id} onClick={() => handleTeamSelect(team.slug)}>
                                {team.name}
                            </Button>
                        ))}
                    <Button leftIcon={<IoAdd size="25px" />} colorScheme="green300" onClick={onOpen}>
                        Create new team
                    </Button>
                </Stack>
            </Card>
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
                        <Stack direction="row" spacing={4}>
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="green300" onClick={handleNewTeamSubmit}>
                                Create
                            </Button>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}

export default TeamPicker;
