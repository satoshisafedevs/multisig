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
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";

function Home() {
    const {
        user,
        gettingUserAuthStatus,
        resendVerificationEmail,
        signOutUser,
    } = useAuth();
    useEffect(() => {
        document.title = "Better Wallet";
    }, []);

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

    if (!user) {
        return <Navigate to="/signin" />;
    }

    if (!user.emailVerified) {
        return (
            <Modal isOpen={!user.emailVerified} size="xl">
                <ModalContent>
                    <ModalHeader>Email verification</ModalHeader>
                    <ModalBody>
                        <Box>
                            Please verify your email and{" "}
                            <Button
                                variant="link"
                                colorScheme="blue"
                                onClick={() => window.location.reload()}
                            >
                                refresh
                            </Button>{" "}
                            the page.
                        </Box>
                        <Box padding="20px 0">
                            Have not received email yet? Click
                            <Button
                                variant="link"
                                colorScheme="blue"
                                onClick={resendVerificationEmail}
                            >
                                here
                            </Button>
                            to re-send verification email.
                        </Box>
                        <Box paddingBottom="20px">
                            Feeling stuck? Click
                            <Button
                                variant="link"
                                colorScheme="blue"
                                onClick={() => signOutUser(user.email)}
                            >
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
                color="blackAlpha.800"
                gridTemplateRows="1fr 1fr"
                gridTemplateColumns="1fr 2fr 1fr"
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
                            <Button
                                leftIcon={<IoAdd size="25px" />}
                                width="100%"
                                colorScheme="green300"
                            >
                                Add Safe wallet
                            </Button>
                        </CardFooter>
                    </Card>
                </GridItem>
                <GridItem area="two">
                    <Card height="100%">
                        <CardBody>2</CardBody>
                    </Card>
                </GridItem>
                <GridItem area="three">
                    <Card height="100%">
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold">
                                Actions
                            </Text>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem area="four">
                    <Card height="100%">
                        <CardBody>4</CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </>
    );
}

export default Home;
