import React, { useEffect } from "react";
import { PropTypes } from "prop-types";
import { Button, Box, Text, Modal, ModalContent, ModalHeader, ModalBody } from "@chakra-ui/react";
import useAuth from "../hooks/useAuth";

export default function EmailVerifyModal({ user }) {
    const { resendVerificationEmail, signOutUser, updateUserData } = useAuth();

    let intervalId;
    let intervalTime = 0;

    const startPolling = () => {
        intervalId = setInterval(async () => {
            intervalTime += 1;
            if (intervalTime >= 300) {
                clearInterval(intervalId);
            }
            if (user.emailVerified) {
                await updateUserData(user, { emailVerified: true });
                clearInterval(intervalId);
                window.location.reload();
            }
            await user.reload();
        }, 1000);
    };

    useEffect(() => {
        startPolling();
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Modal isOpen={!user.emailVerified} size="xl">
            <ModalContent>
                <ModalHeader>Your account requires email verification</ModalHeader>
                <ModalBody>
                    <Box>
                        A verification email has been sent to your inbox. Please verify your email by clicking the link
                        provided. Once done, please{" "}
                        <Button variant="link" colorScheme="blue" onClick={() => window.location.reload()}>
                            refresh
                        </Button>{" "}
                        this page.
                    </Box>
                    <Box padding="20px 0">
                        Haven&apos;t received the email yet? Check your Spam folder or click
                        <Button variant="link" colorScheme="blue" onClick={resendVerificationEmail}>
                            here
                        </Button>
                        to resend the verification email.
                    </Box>
                    <Box paddingBottom="20px">
                        If you&apos;re encountering difficulties, feel free to sign out and try again later. Click
                        <Button
                            variant="link"
                            colorScheme="blue"
                            onClick={() => {
                                signOutUser(user.email);
                                clearInterval(intervalId);
                            }}
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

EmailVerifyModal.propTypes = {
    user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        emailVerified: PropTypes.bool.isRequired,
        reload: PropTypes.func.isRequired,
    }).isRequired,
};
