import { arrayUnion } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Center,
    Heading,
    Spinner,
    Text,
    Input,
    FormControl,
    FormLabel,
    VStack,
    Box,
    useToast,
    Flex,
} from "@chakra-ui/react";
import { doc, getDoc, db, setDoc, acceptInvite } from "../firebase";

function Invite() {
    const location = useLocation();
    const toast = useToast();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const UserNameAndPasswordFields = (
        <>
            <FormControl id="username">
                <FormLabel>Username</FormLabel>
                <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    description="This is what people on the team will see."
                />
            </FormControl>
            <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Text fontSize="sm" mt="2">
                    This will be your login password.
                </Text>
            </FormControl>
            <FormControl id="confirmpassword">
                <FormLabel>Confirm Password</FormLabel>
                <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </FormControl>
        </>
    );

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const inviteRef = doc(db, "invitations", id);
                const inviteSnap = await getDoc(inviteRef);
                if (inviteSnap.exists()) {
                    setInvite(inviteSnap.data());
                } else {
                    setInvite(null);
                }
            } catch (error) {
                console.error("Error fetching invite:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [id]);

    if (loading) {
        return (
            <Center height="100vh">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (!invite || invite.status === "complete") {
        return (
            <Center height="100vh">
                <VStack spacing={4}>
                    <Text fontSize="xl">The invite is invalid or has expired.</Text>
                    <Button colorScheme="green" onClick={() => navigate("/")}>
                        Go Home
                    </Button>
                </VStack>
            </Center>
        );
    }

    const handleAcceptInvite = async () => {
        try {
            if (invite.setPassword) {
                if (password !== confirmPassword) {
                    toast({
                        description: "Passwords do not match.",
                        position: "top",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
                const userDocRef = doc(db, "users", invite.userId);
                await setDoc(
                    userDocRef,
                    {
                        displayName: username,
                    },
                    { merge: true },
                );
            }

            const docRef = doc(db, "users", invite.userId, "teams", invite.teamId);
            await setDoc(docRef, {
                userWalletAddress: walletAddress,
            });
            const teamDocRef = doc(db, "teams", invite.teamId);
            await setDoc(
                teamDocRef,
                {
                    users: arrayUnion(invite.userId),
                },
                { merge: true },
            );
            const teamSnap = await getDoc(teamDocRef);
            acceptInvite({ userId: invite.userId, inviteId: id, password });
            navigate(`/team/${teamSnap.data().slug}`);

            console.log("Document written with ID: ", docRef.id);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <Flex width="100%" height="100vh" alignItems="center" justifyContent="center">
            <Box>
                <Card p={5}>
                    <Center flexDirection="column" spacing={4}>
                        <Heading>Welcome to Satoshi Safe</Heading>
                        <Text m="10px">
                            You have been invited by {invite.senderDisplayName} to join {invite.teamName}.
                        </Text>
                        <VStack spacing={3} width="100%" maxWidth="400px" mt="10px">
                            {invite.setPassword && UserNameAndPasswordFields}
                            <FormControl id="wallet-address">
                                <FormLabel>Wallet Address</FormLabel>
                                <Input
                                    placeholder="Wallet address to use with this account"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    description="Associate this Metamask wallet with your account."
                                />
                            </FormControl>

                            <Button colorScheme="green300" onClick={() => handleAcceptInvite()} m="20px">
                                Accept Invite
                            </Button>
                        </VStack>
                    </Center>
                </Card>
            </Box>
        </Flex>
    );
}

export default Invite;
