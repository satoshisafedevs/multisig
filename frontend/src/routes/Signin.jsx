import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Spinner,
    Stack,
    Tooltip,
    useColorModeValue,
    useColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Navigate } from "react-router-dom";
import ThemeSwitcher from "../components/ThemeSwitcher";
import useAuth from "../hooks/useAuth";
import ReactLogo from "../img/ReactLogo";
import { useUser } from "../providers/User";
import theme from "../theme";

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
    const { colorMode } = useColorMode();

    useEffect(() => {
        document.title = "Sign in - Satoshi Safe";
        if (noAccount) {
            document.title = "Create account - Satoshi Safe";
        }
        if (forgotPassword) {
            document.title = "Reset password - Satoshi Safe";
        }
    }, [noAccount, forgotPassword]);

    const handleNoAccount = () => {
        setNoAccount(!noAccount);
        setForgotPassword(false);
    };

    const handleForgotPassword = () => setForgotPassword(!forgotPassword);

    const handleEmail = (event) => setEmail(event.target.value.trim());

    const handlePassword = (event) => setPassword(event.target.value.trim());

    const handleConfirmPassword = (event) => setConfirmPassword(event.target.value.trim());

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
                        <Stack spacing="15px" width="325px">
                            <Box display="flex" margin="auto" maxWidth="100%" padding="15px 0">
                                <ReactLogo
                                    satoshiTextColor={
                                        colorMode === "light"
                                            ? "var(--chakra-colors-blackAlpha-900)"
                                            : "var(--chakra-colors-whiteAlpha-900)"
                                    }
                                />
                            </Box>
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
                                    borderColor: colorMode === "light" ? "gray.200" : "gray.600",
                                }}
                                _hover={{
                                    borderColor: colorMode === "light" ? "gray.300" : "#5f6774",
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
                                            background: "unset",
                                            borderColor: colorMode === "light" ? "gray.200" : "gray.600",
                                        }}
                                        _hover={{
                                            borderColor: colorMode === "light" ? "gray.300" : "#5f6774",
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
                                    colorScheme="blueSwatch"
                                    onClick={handleSubmit}
                                    isLoading={isSigningIn || isResettingPassword}
                                    loadingText={isSigningIn && "Signing in..."}
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
                            <Button
                                colorScheme="blueSwatch"
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
