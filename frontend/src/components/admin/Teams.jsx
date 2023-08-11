import React, { useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { IoExitOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../providers/User";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";

function Teams() {
    const { teamsData, leaveTeam, currentTeam } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const { navigate } = useNavigate();

    const handleLeaveTeam = (team) => {
        // your logic to handle leaving the team goes here
        leaveTeam(team);
        if (team.id === currentTeam.id) {
            navigate("/");
        }
    };

    return (
        <Box padding="10px" minWidth="500px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Teams
                    </Heading>
                    <Text>Manage the teams associated with your account</Text>
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
                        {teamsData.map((team) => (
                            <Tr key={team.name}>
                                <Td>{team.name}</Td>
                                <Td>{team.users.length}</Td>
                                <Td>
                                    <Button
                                        rightIcon={<IoExitOutline size="20px" />}
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => handleLeaveTeam(team)}
                                    >
                                        Leave Team
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            </Box>
        </Box>
    );
}

export default Teams;
