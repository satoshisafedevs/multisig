import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Heading,
    Text,
    Button,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import { IoExitOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../providers/User";

function Teams() {
    const { teamsData, leaveTeam, currentTeam, getUserTeamsData } = useUser();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [leave, setLeave] = useState();
    const cancelRef = useRef();
    const [filteredTeamsData, setFilteredTeamsData] = useState([]);

    const satoshiSafeUserIds = ["ZyEVb31sYqgpmDw2tDlxCj2hI5B2"]; // TODO: add Prod user id

    useEffect(() => {
        if (teamsData) {
            const filteredData = teamsData.map((team) => ({
                ...team,
                users: team?.users?.filter((user) => !satoshiSafeUserIds.includes(user)),
            }));
            setFilteredTeamsData(filteredData);
        }
    }, [teamsData]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                cancelRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleLeaveTeam = async (team) => {
        // your logic to handle leaving the team goes here
        onClose();
        setLeave();
        if (team.id === currentTeam.id) {
            navigate("/");
        }
        leaveTeam(team);
        const resp = await getUserTeamsData();
        if (resp) {
            toast({
                title: "Team left",
                description: `You have left the team ${team.name}.`,
                status: "success",
                position: "top",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    onClose();
                    setLeave();
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Leave team</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{`Are you sure you want to leave ${leave?.name}?`}</ModalBody>

                    <ModalFooter>
                        <Button
                            // stupid Chakra focus not working for button
                            _focus={{
                                boxShadow: "var(--chakra-shadows-outline)",
                            }}
                            ref={cancelRef}
                            mr={3}
                            onClick={() => {
                                onClose();
                                setLeave();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={() => handleLeaveTeam(leave)}>
                            Leave
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Box padding="10px" minWidth="500px">
                <Flex justifyContent="space-between" alignItems="center" mb="20px">
                    <Box>
                        <Heading mb="10px" size="lg">
                            Teams
                        </Heading>
                        <Text>Manage the teams associated with your account.</Text>
                    </Box>
                </Flex>
                <Box>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Team Name</Th>
                                <Th>Users</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredTeamsData.map((team) => (
                                <Tr key={team.name} style={{ fontVariantNumeric: "normal" }}>
                                    <Td>{team.name}</Td>
                                    <Td>{team.users.length}</Td>
                                    <Td>
                                        <Button
                                            rightIcon={<IoExitOutline size="20px" />}
                                            colorScheme="red"
                                            variant="outline"
                                            onClick={() => {
                                                onOpen();
                                                setLeave(team);
                                            }}
                                        >
                                            Leave team
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Box>
        </>
    );
}

export default Teams;
