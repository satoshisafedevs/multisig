import {
    Button,
    Card,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Stack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { addDoc, collection, db, doc, setDoc, addSupportUserToTeam } from "../firebase";
import { useSafeBalance } from "../providers/SafeBalance";
import { useTransactions } from "../providers/Transactions";
import { useUser } from "../providers/User";
import { useWagmi } from "../providers/Wagmi";
import { useWalletConnect } from "../providers/WalletConnect";

const MAX_TEAM_NAME_LENGTH = 50;

function TeamPicker() {
    const toast = useToast();
    const { user, firestoreUser, teamsData, setCurrentTeam, setTeamUsersInfo, getUserTeamsData } = useUser();
    const { setWalletMismatch } = useWagmi();
    const { resetBalanceData } = useSafeBalance();
    const {
        setFirestoreTransactions,
        setIsDataLoaded,
        setAllTransactionsCount,
        setLimitTransactionsValue,
        setFilteredSafes,
    } = useTransactions();
    const { disconnectAll } = useWalletConnect();
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
        setFirestoreTransactions();
        setIsDataLoaded(false);
        setAllTransactionsCount(0);
        setLimitTransactionsValue(25);
        setFilteredSafes([]);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const updateTeamName = (newName) => {
        if (newName.length > MAX_TEAM_NAME_LENGTH) {
            toast({
                description: "Team name too long. Maximum 50 characters allowed.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (/[^a-zA-Z0-9\s]/.test(newName)) {
            // Regex to check for special characters
            toast({
                description: "Special characters are not allowed in team name.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setTeamName(newName);
    };

    const handleTeamSelect = (slug) => {
        disconnectAll();
        navigate(`/team/${slug}`);
    };

    const handleNewTeamSubmit = async () => {
        try {
            if (teamName.length === 0 || walletAddress.length === 0) {
                toast({
                    description: "Please fill in all fields.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            setLoading(true);
            const newTeamData = {
                name: teamName,
                ownerId: firestoreUser.uid,
                users: [firestoreUser.uid],
                // generate a slug from the team name
                slug: `${teamName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
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
            await addSupportUserToTeam({ teamId: newDoc.id });
            // await createNewSatoshiBot({ teamId: newDoc.id });
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
                        <Button leftIcon={<IoAdd size="25px" />} colorScheme="blueSwatch" onClick={onOpen}>
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
                                <Input
                                    value={teamName}
                                    onChange={(e) => updateTeamName(e.target.value)}
                                    ref={inputRef}
                                />
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
                                    colorScheme="blueSwatch"
                                    onClick={handleNewTeamSubmit}
                                    isLoading={loading}
                                    isDisabled={
                                        teamName.length === 0 ||
                                        walletAddress.length === 0 ||
                                        !ethers.utils.isAddress(walletAddress)
                                    }
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
