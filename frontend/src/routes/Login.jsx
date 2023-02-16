import React, { useState, useEffect } from "react";
import {
    Flex,
    FormControl,
    FormLabel,
    Stack,
    Switch,
    Input,
    Button,
    useToast,
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

    if (user) {
        return (
            <Flex
                height="100vh"
                direction="column"
                align="center"
                justify="center"
            >
                <Stack spacing="10px">
                    <span>Hello {user.email}!</span>
                    <Button
                        width="250px"
                        colorScheme="blue"
                        onClick={handleLogOut}
                    >
                        Log out
                    </Button>
                </Stack>
            </Flex>
        );
    }

    return (
        <Flex height="100vh" direction="column" align="center" justify="center">
            <Stack spacing="10px">
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
                    width="250px"
                    placeholder="Email"
                    onChange={handleEmail}
                    value={email}
                />
                <Input
                    width="250px"
                    placeholder="Password"
                    onChange={handlePassword}
                    value={password}
                />
                <Button
                    width="250px"
                    colorScheme="blue"
                    onClick={handleLogIn}
                    isLoading={loading}
                >
                    {registerMe ? "Sign up" : "Log in"}
                </Button>
            </Stack>
        </Flex>
    );
}

export default Login;
