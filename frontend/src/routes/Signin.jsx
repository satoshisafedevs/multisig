import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
    Box,
    Card,
    CardBody,
    Image,
    Flex,
    Spinner,
    Center,
    Heading,
    Stack,
    Input,
    InputGroup,
    InputRightElement,
    Tooltip,
    Button,
    IconButton,
    useColorModeValue,
} from "@chakra-ui/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import logo from "../img/logo.svg";
import useAuth from "../hooks/useAuth";
import ThemeSwitcher from "../components/ThemeSwitcher";

function Signin() {
    const {
        user,
        gettingUserAuthStatus,
        isSigningIn,
        createUser,
        signInUser,
        resetPassword,
        isResettingPassword,
    } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [noAccount, setNoAccount] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const filterValue = useColorModeValue("invert(90%)", "none");
    const colorValue = useColorModeValue("blackAlpha.800", "whiteAlpha.900");
    const hoverValue = useColorModeValue("blackAlpha.800", "white");
    const chromeAutofill = useColorModeValue("white", "#2D3748"); // idk why gray.700 not working here

    useEffect(() => {
        document.title = "Sign in - Better Wallet";
    }, []);

    const handleNoAccount = () => {
        setNoAccount(!noAccount);
        setForgotPassword(false);
    };

    const handleForgotPassword = () => setForgotPassword(!forgotPassword);

    const handleEmail = (event) => setEmail(event.target.value);

    const handlePassword = (event) => setPassword(event.target.value);

    const handleConfirmPassword = (event) =>
        setConfirmPassword(event.target.value);

    const handleHideShow = () => setShowPassword(!showPassword);

    const handleSubmit = () => {
        if (forgotPassword) {
            resetPassword(email);
            return;
        }
        if (noAccount) {
            createUser(email, password);
            return;
        }
        signInUser(email, password);
    };

    const formTitle = () => {
        if (forgotPassword) {
            return "Reset your password";
        }
        if (noAccount) {
            return "Create your account";
        }
        return "Sign in";
    };

    const buttonLabel = () => {
        if (forgotPassword) {
            return "Reset password";
        }
        if (noAccount) {
            return "Create account";
        }
        return "Sign in";
    };

    if (gettingUserAuthStatus) {
        return (
            <Spinner
                color="blue.500"
                speed="1s"
                size="xl"
                thickness="4px"
                emptyColor="gray.200"
                margin="auto"
            />
        );
    }

    if (user) {
        return <Navigate to="/" />;
    }

    return (
        <>
            <Flex justify="flex-end" height="0">
                <ThemeSwitcher style={{ margin: "10px 10px 0 0" }} />
            </Flex>
            <Flex flexGrow="1" align="center" justify="center">
                <Card margin="20px">
                    <CardBody>
                        <Stack spacing="15px" width="300px">
                            <Image
                                src={logo}
                                filter={filterValue}
                                paddingTop="10px"
                                paddingBottom="20px"
                            />
                            <Center>
                                <Heading
                                    size="lg"
                                    paddingBottom="40px"
                                    color={colorValue}
                                >
                                    {formTitle()}
                                </Heading>
                            </Center>
                            <Input
                                placeholder="Email"
                                onChange={handleEmail}
                                value={email}
                                _autofill={{
                                    boxShadow: `0 0 0 1000px ${chromeAutofill} inset`,
                                }}
                            />
                            {!forgotPassword && (
                                <InputGroup>
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Password"
                                        onChange={handlePassword}
                                        value={password}
                                        _autofill={{
                                            boxShadow: `0 0 0 1000px ${chromeAutofill} inset`,
                                        }}
                                    />
                                    <InputRightElement>
                                        <Tooltip
                                            label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            hasArrow
                                        >
                                            <IconButton
                                                focusable
                                                boxSize="38px"
                                                variant="link"
                                                _hover={{
                                                    color: hoverValue,
                                                }}
                                                onClick={handleHideShow}
                                                icon={
                                                    showPassword ? (
                                                        <IoEyeOff />
                                                    ) : (
                                                        <IoEye />
                                                    )
                                                }
                                            />
                                        </Tooltip>
                                    </InputRightElement>
                                </InputGroup>
                            )}
                            {noAccount && (
                                <InputGroup>
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Confirm password"
                                        onChange={handleConfirmPassword}
                                        value={confirmPassword}
                                        _autofill={{
                                            boxShadow: `0 0 0 1000px ${chromeAutofill} inset`,
                                        }}
                                    />
                                    <InputRightElement>
                                        <Tooltip
                                            label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            hasArrow
                                        >
                                            <IconButton
                                                focusable
                                                boxSize="38px"
                                                variant="link"
                                                _hover={{
                                                    color: hoverValue,
                                                }}
                                                onClick={handleHideShow}
                                                icon={
                                                    showPassword ? (
                                                        <IoEyeOff />
                                                    ) : (
                                                        <IoEye />
                                                    )
                                                }
                                            />
                                        </Tooltip>
                                    </InputRightElement>
                                </InputGroup>
                            )}
                            <Tooltip
                                label="Passwords do not match"
                                isOpen={
                                    noAccount && password !== confirmPassword
                                }
                                hasArrow
                            >
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSubmit}
                                    isLoading={
                                        isSigningIn || isResettingPassword
                                    }
                                    isDisabled={
                                        noAccount &&
                                        password !== confirmPassword
                                    }
                                >
                                    {buttonLabel()}
                                </Button>
                            </Tooltip>
                        </Stack>
                        {!noAccount && (
                            <Box textAlign="right" marginTop="5px">
                                <Button
                                    variant="link"
                                    size="sm"
                                    fontWeight="normal"
                                    onClick={handleForgotPassword}
                                >
                                    {!forgotPassword
                                        ? "Forgot password?"
                                        : "Back to sign in"}
                                </Button>
                            </Box>
                        )}
                        <Center paddingTop="70px">
                            {noAccount ? "Already a member?" : "Not a member?"}
                            <Button
                                colorScheme="blue"
                                paddingLeft="10px"
                                variant="link"
                                onClick={handleNoAccount}
                            >
                                {noAccount ? "Sign in" : "Create account"}
                            </Button>
                        </Center>
                    </CardBody>
                </Card>
            </Flex>
        </>
    );
}

export default Signin;
