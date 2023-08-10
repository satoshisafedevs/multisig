import React, { useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useUser } from "../../providers/User";
import InviteUserModal from "./InviteUserModal";

function Users() {
    const { teamUsersInfo } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [sortAscending, setSortAscending] = useState(true);

    const sortedUsers = teamUsersInfo
        ? Object.entries(teamUsersInfo).sort(([, a], [, b]) => {
              if (sortAscending) {
                  return a.displayName.localeCompare(b.displayName);
              }
              return b.displayName.localeCompare(a.displayName);
          })
        : [];

    return (
        <Box padding="10px" minWidth="500px" margin="10px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading as="h2" mb="10px">
                        Users
                    </Heading>
                    <Text>Manage the users associated with the team</Text>
                </Box>
            </Flex>
            <Box>
                <Table>
                    <Thead>
                        <Tr>
                            <Th onClick={() => setSortAscending(!sortAscending)} style={{ cursor: "pointer" }}>
                                Username {sortAscending ? "↑" : "↓"}
                            </Th>
                            <Th>Email</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedUsers.map(([, child]) => (
                            <Tr key={child.email}>
                                <Td>{child.displayName}</Td>
                                <Td>{child.email}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <Button
                    leftIcon={<IoAdd size="25px" />}
                    width="200px"
                    colorScheme="green300"
                    onClick={() => setModalOpen(true)}
                    position="absolute"
                    top="20px"
                    right="20px"
                >
                    Add User
                </Button>
                <InviteUserModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            </Box>
        </Box>
    );
}

export default Users;
