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
import { useUser } from "../providers/User";
import useAuth from "../hooks/useAuth";
import ThemeSwitcher from "../components/ThemeSwitcher";
import theme from "../theme";

const logo =
    "https://firebasestorage.googleapis.com/v0/b/" +
    "prontoai-playground.appspot.com/o/logo%2Fsatoshi_safe.png?alt=media&token=b5333920-3b92-447c-93b3-2b5f6e34c09e";

function Signin() {
    const { user, gettingUserAuthStatus } = useUser();
    const { isSigningIn, createUser, signInUser, resetPassword, isResettingPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [noAccount, setNoAccount] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const colorValue = useColorModeValue("blackAlpha.800", "whiteAlpha.900");
    const hoverValue = useColorModeValue("blackAlpha.800", "white");
    const chromeAutofill = useColorModeValue("white", theme.colors.gray[700]); // just gray.700 not working here

    useEffect(() => {
        document.title = "Sign in - Satoshi Safe";
    }, []);

    const handleNoAccount = () => {
        setNoAccount(!noAccount);
        setForgotPassword(false);
    };

    const handleForgotPassword = () => setForgotPassword(!forgotPassword);

    const handleEmail = (event) => setEmail(event.target.value);

    const handlePassword = (event) => setPassword(event.target.value);

    const handleConfirmPassword = (event) => setConfirmPassword(event.target.value);

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
        return <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />;
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
                            <Image src={logo} paddingTop="10px" paddingBottom="20px" />
                            <Center>
                                <Heading size="lg" paddingBottom="40px" color={colorValue}>
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
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        onChange={handlePassword}
                                        value={password}
                                        _autofill={{
                                            boxShadow: `0 0 0 1000px ${chromeAutofill} inset`,
                                        }}
                                    />
                                    <InputRightElement>
                                        <Tooltip label={showPassword ? "Hide password" : "Show password"} hasArrow>
                                            <IconButton
                                                focusable
                                                boxSize="38px"
                                                variant="link"
                                                _hover={{
                                                    color: hoverValue,
                                                }}
                                                onClick={handleHideShow}
                                                icon={showPassword ? <IoEyeOff /> : <IoEye />}
                                            />
                                        </Tooltip>
                                    </InputRightElement>
                                </InputGroup>
                            )}
                            {noAccount && (
                                <InputGroup>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        onChange={handleConfirmPassword}
                                        value={confirmPassword}
                                        _autofill={{
                                            boxShadow: `0 0 0 1000px ${chromeAutofill} inset`,
                                        }}
                                    />
                                    <InputRightElement>
                                        <Tooltip label={showPassword ? "Hide password" : "Show password"} hasArrow>
                                            <IconButton
                                                focusable
                                                boxSize="38px"
                                                variant="link"
                                                _hover={{
                                                    color: hoverValue,
                                                }}
                                                onClick={handleHideShow}
                                                icon={showPassword ? <IoEyeOff /> : <IoEye />}
                                            />
                                        </Tooltip>
                                    </InputRightElement>
                                </InputGroup>
                            )}
                            <Tooltip
                                label="Passwords do not match"
                                isOpen={noAccount && password !== confirmPassword}
                                hasArrow
                            >
                                <Button
                                    colorScheme="green300"
                                    onClick={handleSubmit}
                                    isLoading={isSigningIn || isResettingPassword}
                                    isDisabled={noAccount && password !== confirmPassword}
                                >
                                    {buttonLabel()}
                                </Button>
                            </Tooltip>
                        </Stack>
                        {!noAccount && (
                            <Box textAlign="right" marginTop="5px">
                                <Button variant="link" size="sm" fontWeight="normal" onClick={handleForgotPassword}>
                                    {!forgotPassword ? "Forgot password?" : "Back to sign in"}
                                </Button>
                            </Box>
                        )}
                        <Center paddingTop="70px">
                            {noAccount ? "Already a member?" : "Not a member?"}
                            <Button colorScheme="blue" paddingLeft="10px" variant="link" onClick={handleNoAccount}>
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
