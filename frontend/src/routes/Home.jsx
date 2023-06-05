import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
    Button,
    Box,
    Card,
    CardBody,
    CardFooter,
    Grid,
    GridItem,
    Text,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Input,
} from "@chakra-ui/react";
import { IoAdd, IoSend } from "react-icons/io5";
import useAuth from "../hooks/useAuth";
import Header from "../components/Header";
import LineChart from "../components/LineChart";

function Home() {
    const { user, gettingUserAuthStatus, resendVerificationEmail, signOutUser } = useAuth();
    useEffect(() => {
        document.title = "Better Wallet";
    }, []);

    if (gettingUserAuthStatus) {
        return <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />;
    }

    if (!user) {
        return <Navigate to="/signin" />;
    }

    if (!user.emailVerified) {
        return (
            <Modal isOpen={!user.emailVerified} size="xl">
                <ModalContent>
                    <ModalHeader>Your account requires email verification</ModalHeader>
                    <ModalBody>
                        <Box>
                            A verification email has been sent to your inbox. Please verify your email by clicking the
                            link provided. Once done, please{" "}
                            <Button variant="link" colorScheme="blue" onClick={() => window.location.reload()}>
                                refresh
                            </Button>{" "}
                            this page.
                        </Box>
                        <Box padding="20px 0">
                            Haven&apos;t received the email yet? Click
                            <Button variant="link" colorScheme="blue" onClick={resendVerificationEmail}>
                                here
                            </Button>
                            to resend the verification email.
                        </Box>
                        <Box paddingBottom="20px">
                            If you&apos;re encountering difficulties, feel free to sign out and try again later. Click
                            <Button variant="link" colorScheme="blue" onClick={() => signOutUser(user.email)}>
                                here
                            </Button>
                            to sign out from <Text as="i">{user.email}</Text>.
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <>
            <Header />
            <Grid
                height="100%"
                minHeight="500px"
                gap="20px"
                padding="10px"
                gridTemplateRows="1fr 1fr"
                gridTemplateColumns="0.8fr 2fr 1fr"
                gridTemplateAreas="
                    'one two four'
                    'one three four'
                "
            >
                <GridItem minWidth="250px" area="one">
                    <Card height="100%">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold">
                                Wallets
                            </Text>
                        </CardBody>
                        <CardFooter>
                            <Button leftIcon={<IoAdd size="25px" />} width="100%" colorScheme="green300">
                                Add Safe wallet
                            </Button>
                        </CardFooter>
                    </Card>
                </GridItem>
                <GridItem minWidth="350px" area="two">
                    <Card height="100%">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold">
                                Portfolio
                            </Text>
                            <LineChart />
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem minWidth="350px" area="three">
                    <Card height="100%">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold">
                                Control panel
                            </Text>
                        </CardBody>
                        <CardFooter>
                            <Input placeholder="Chat or action" />
                            <Box>
                                <Button marginLeft="20px" colorScheme="green300" rightIcon={<IoSend size="20px" />}>
                                    Send
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </GridItem>
                <GridItem minWidth="300px" area="four">
                    <Card height="100%">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold">
                                Actions
                            </Text>
                            <Input marginTop="10px" placeholder="Filter actions" />
                        </CardBody>
                        <CardFooter>
                            <Button leftIcon={<IoAdd size="25px" />} width="100%" colorScheme="green300">
                                Add protocol function
                            </Button>
                        </CardFooter>
                    </Card>
                </GridItem>
            </Grid>
        </>
    );
}

export default Home;
