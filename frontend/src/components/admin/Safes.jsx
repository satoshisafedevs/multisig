import React, { useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useUser } from "../../providers/User";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";
import SafeOwnersList from "./SafeOwnersList";
import SafeStatus from "./SafeStatus";

function Safes() {
    const { currentTeam, teamUsersInfo } = useUser();
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Box padding="10px" minWidth="500px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Safes
                    </Heading>
                    <Text>Manage the safes associated with your Satoshi Safe team</Text>
                </Box>
            </Flex>
            <Box>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Status</Th>
                            <Th>Safe Address</Th>
                            <Th>Owners</Th>
                            <Th>Network</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentTeam &&
                            currentTeam.safes &&
                            currentTeam.safes.map((safe) => (
                                <Tr key={safe.safeAddress}>
                                    <Td>
                                        <SafeStatus safe={safe} teamUsersInfo={teamUsersInfo} />
                                    </Td>
                                    <Td>{safe.safeAddress}</Td>
                                    <Td>
                                        <SafeOwnersList safe={safe} teamUsersInfo={teamUsersInfo} />
                                    </Td>
                                    <Td>{safe.network}</Td>
                                </Tr>
                            ))}
                    </Tbody>
                </Table>
                <Button
                    leftIcon={<IoAdd size="25px" />}
                    colorScheme="green300"
                    onClick={() => setModalOpen(true)}
                    position="absolute"
                    top="20px"
                    right="20px"
                >
                    Add Satoshi Safe
                </Button>
                <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            </Box>
        </Box>
    );
}

export default Safes;
