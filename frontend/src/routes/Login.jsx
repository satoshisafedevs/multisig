import React, { useState, useEffect } from "react";
import {
    Flex,
    FormControl,
    FormLabel,
    Stack,
    Switch,
    Input,
    Button,
    IconButton,
    useToast,
    useColorMode,
} from "@chakra-ui/react";
import {
    auth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "../firebase";

function Login() {
    const toast = useToast();
    const { colorMode, toggleColorMode } = useColorMode();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registerMe, setRegisterMe] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                setUser(userAuth);
            } else setUser(null);
        });
        return unsubscribe;
    }, []);

    const signUp = () => {
        setLoading(true);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setLoading(false);
                setUser(userCredential.user);
            })
            .catch((error) => {
                setLoading(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const logIn = () => {
        setLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setLoading(false);
                setUser(userCredential.user);
            })
            .catch((error) => {
                setLoading(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const handleSwitch = () => {
        setRegisterMe(!registerMe);
    };

    const handleEmail = (event) => {
        setEmail(event.target.value);
    };

    const handlePassword = (event) => {
        setPassword(event.target.value);
    };

    const handleLogIn = () => {
        if (registerMe) {
            signUp();
            return;
        }
        logIn();
    };

    const handleLogOut = () => {
        signOut(auth)
            .then(() => {
                toast({
                    description: "Logged out successfully.",
                    position: "top",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    return (
        <Flex height="100vh" direction="column" align="center" justify="center">
            <IconButton
                aria-label="Color mode"
                position="fixed"
                top="10px"
                right="10px"
                onClick={toggleColorMode}
                icon={colorMode === "light" ? <>🌚</> : <>🌝</>}
            />
            <Stack spacing="10px" width="250px">
                {user ? (
                    <>
                        {" "}
                        <span>Hello {user.email}!</span>
                        <Button colorScheme="blue" onClick={handleLogOut}>
                            Log out
                        </Button>
                    </>
                ) : (
                    <>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="email-alerts" marginBottom={0}>
                                First Time User?
                            </FormLabel>
                            <Switch
                                id="email-alerts"
                                size="lg"
                                onChange={handleSwitch}
                            />
                        </FormControl>
                        <Input
                            placeholder="Email"
                            onChange={handleEmail}
                            value={email}
                        />
                        <Input
                            placeholder="Password"
                            onChange={handlePassword}
                            value={password}
                        />
                        <Button
                            colorScheme="blue"
                            onClick={handleLogIn}
                            isLoading={loading}
                        >
                            {registerMe ? "Sign up" : "Log in"}
                        </Button>
                    </>
                )}
            </Stack>
        </Flex>
    );
}

export default Login;
