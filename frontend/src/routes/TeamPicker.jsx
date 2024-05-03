import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
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
import { IoAddCircleOutline } from "react-icons/io5";
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
    const { user, firestoreUser, teamsData, setCurrentTeam, setTeamUsersInfo, getUserTeamsData, setUserTeamData } =
        useUser();
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
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTeams, setFilteredTeams] = useState();

    useEffect(() => {
        document.title = "Select your team - Satoshi Safe";
        setCurrentTeam(null);
        setTeamUsersInfo(null);
        setUserTeamData();
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

    useEffect(() => {
        if (teamsData) {
            setFilteredTeams(teamsData); // Initialize with unfiltered data
        }
    }, [teamsData]);

    const handleFilterTeams = (searchValue) => {
        if (!searchValue) {
            setFilteredTeams(teamsData);
        } else {
            const filtered = teamsData.filter((team) => team.name.toLowerCase().includes(searchValue.toLowerCase()));

            setFilteredTeams(filtered);
        }
    };

    const handleSearchChange = (event) => {
        const { value } = event.target;
        setSearchTerm(value);
        handleFilterTeams(value);
    };

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
            <Box display="flex" flexDirection="column" alignItems="center" padding="40px" overflow="auto" height="100%">
                <Heading fontSize="2xl" mb={5}>
                    Select your team
                </Heading>
                <Card padding={5} overflow="auto" width="100%" maxWidth="60ch">
                    {teamsData?.length === 0 && (
                        <Alert status="info" borderRadius="var(--chakra-radii-base)">
                            <AlertIcon />
                            You are not part of any team.
                        </Alert>
                    )}
                    {!filteredTeams ? (
                        <Box display="flex">
                            <Spinner
                                color="blue.500"
                                speed="1s"
                                size="md"
                                thickness="2px"
                                emptyColor="gray.200"
                                margin="auto"
                                paddingBottom={15}
                            />
                        </Box>
                    ) : (
                        <>
                            {teamsData?.length > 10 && (
                                <CardHeader padding="0 0 15px 0">
                                    <Input
                                        placeholder="Search teams..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </CardHeader>
                            )}
                            <CardBody padding="0" overflow="auto">
                                <Stack direction="column" align="stretch" spacing={4} overflow="auto">
                                    {Array.isArray(filteredTeams) &&
                                        filteredTeams.map((team) => (
                                            <Button key={team.id} onClick={() => handleTeamSelect(team.slug)}>
                                                {team.name}
                                            </Button>
                                        ))}
                                    {searchTerm && filteredTeams.length === 0 && (
                                        <Alert status="info" borderRadius="var(--chakra-radii-base)">
                                            <AlertIcon />
                                            No teams found
                                        </Alert>
                                    )}
                                </Stack>
                            </CardBody>
                            <CardFooter padding="15px 0 0 0">
                                <Button
                                    width="100%"
                                    rightIcon={<IoAddCircleOutline size="25px" />}
                                    colorScheme="blueSwatch"
                                    onClick={onOpen}
                                >
                                    Create new team
                                </Button>
                            </CardFooter>
                        </>
                    )}
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
                                    loadingText="Creating..."
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
            </Box>
        </>
    );
}

export default TeamPicker;
