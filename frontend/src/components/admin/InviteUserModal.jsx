import React, { useState } from "react";
import PropTypes from "prop-types";
import { IoPaperPlaneOutline } from "react-icons/io5";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Input,
    Textarea,
    FormControl,
    FormLabel,
    useToast,
} from "@chakra-ui/react";
import { useUser } from "../../providers/User";
import { inviteUser } from "../../firebase";

function InviteUserModal({ isOpen, setIsOpen }) {
    const { currentTeam, teamUsersInfo } = useUser();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleInvite = () => {
        // Handle the invite logic here
        const emailSet = new Set();
        Object.values(teamUsersInfo).forEach((user) => {
            emailSet.add(user.email);
        });
        if (emailSet.has(email)) {
            toast({
                description: `User with email ${email} is already in the team.`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } else {
            inviteUser({ email, teamid: currentTeam.id, message });
            setIsOpen(false);
            setEmail("");
            setMessage("");
            toast({
                description: `Successfully sent an invite to ${email}.`,
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Invite user</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl id="email" mb={4}>
                        <FormLabel>Email address</FormLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                        />
                    </FormControl>
                    <FormControl id="message">
                        <FormLabel>Invitation message</FormLabel>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your invitation message here..."
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blueSwatch"
                        onClick={handleInvite}
                        rightIcon={<IoPaperPlaneOutline size="20px" />}
                    >
                        Send invite
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

InviteUserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};
export default InviteUserModal;
