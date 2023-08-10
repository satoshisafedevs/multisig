import React, { useState, useEffect, useRef } from "react";
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
    useToast,
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { db, addDoc, collection, setDoc, doc, Timestamp } from "../firebase";
import { useUser } from "../providers/User";
import { useWagmi } from "../providers/Wagmi";
import { useSafeBalance } from "../providers/SafeBalance";
import Header from "../components/Header";

function TeamPicker() {
    const toast = useToast();
    const { user, firestoreUser, teamsData, setCurrentTeam, setTeamUsersInfo, getUserTeamsData } = useUser();
    const { setWalletMismatch } = useWagmi();
    const { resetBalanceData } = useSafeBalance();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [teamName, setTeamName] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();

    useEffect(() => {
        document.title = "Select your team - Satoshi Safe";
        setCurrentTeam(null);
        setTeamUsersInfo(null);
        setWalletMismatch(false);
        resetBalanceData();
        getUserTeamsData(user);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleTeamSelect = (slug) => navigate(`/team/${slug}`);

    const handleNewTeamSubmit = async () => {
        setLoading(true);

        try {
            const newSatoshiBotData = {
                displayName: "Satoshi Bot",
                email: "support@satoshisafe.ai",
                creationTime: Timestamp.now(),
            };
            const newSatoshiBotDoc = await addDoc(collection(db, "users"), newSatoshiBotData);
            const newTeamData = {
                name: teamName,
                users: [firestoreUser.uid],
                // generate a slug from the team name
                slug: `${teamName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
                botUid: newSatoshiBotDoc.id,
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
            if ((await getUserTeamsData(user)) === true) {
                // navigate once new team is ready
                handleTeamSelect(newTeamData.slug);
            }
            setTeamName("");
            setWalletAddress("");
            onClose();
            setLoading(false);
        } catch (error) {
            toast({
                description: `Failed to create team: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Container align="center" margin="auto" height="80vh">
                <Heading fontSize="2xl" mb={5}>
                    Select your team
                </Heading>
                <Card padding={5}>
                    <Stack direction="column" align="stretch" spacing={4}>
                        {!teamsData && (
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
                        {Array.isArray(teamsData) &&
                            teamsData.map((team) => (
                                <Button key={team.id} onClick={() => handleTeamSelect(team.slug)}>
                                    {team.name}
                                </Button>
                            ))}
                        <Button leftIcon={<IoAdd size="25px" />} colorScheme="green300" onClick={onOpen}>
                            Create new team
                        </Button>
                    </Stack>
                </Card>
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a new team</ModalHeader>
                        <ModalCloseButton top="var(--chakra-space-3)" />
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Team name</FormLabel>
                                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} ref={inputRef} />
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
                                <Button
                                    colorScheme="green300"
                                    onClick={handleNewTeamSubmit}
                                    isLoading={loading}
                                    isDisabled={teamName.length === 0 || walletAddress.length === 0}
                                >
                                    Create
                                </Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Container>
        </>
    );
}

export default TeamPicker;
