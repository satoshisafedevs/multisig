import React, { useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { IoAdd, IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import InviteUserModal from "./InviteUserModal";

function Users() {
    const { teamUsersInfo } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [sortAscending, setSortAscending] = useState(true);
    const hoverColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
    const iconStyle = { display: "inline", marginLeft: "5px", verticalAlign: "sub" };

    const sortedUsers = teamUsersInfo
        ? Object.entries(teamUsersInfo).sort(([, a], [, b]) => {
              if (sortAscending) {
                  return a.displayName.localeCompare(b.displayName);
              }
              return b.displayName.localeCompare(a.displayName);
          })
        : [];

    return (
        <Box padding="10px" minWidth="500px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Users
                    </Heading>
                    <Text>Manage the users associated with the team</Text>
                </Box>
                <Button
                    leftIcon={<IoAdd size="25px" />}
                    colorScheme="blueSwatch"
                    onClick={() => setModalOpen(true)}
                    alignSelf="flex-start"
                >
                    Add User
                </Button>
            </Flex>
            <Box>
                <Table>
                    <Thead>
                        <Tr>
                            <Th
                                onClick={() => setSortAscending(!sortAscending)}
                                cursor="pointer"
                                display="flex"
                                alignItems="center"
                                _hover={{
                                    color: hoverColor,
                                }}
                            >
                                Username
                                {sortAscending ? (
                                    <IoChevronUpOutline size="15px" style={iconStyle} />
                                ) : (
                                    <IoChevronDownOutline size="15px" style={iconStyle} />
                                )}
                            </Th>
                            <Th>Email</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedUsers.map(([, child]) => (
                            <Tr key={child.email || child.displayName}>
                                <Td>{child.displayName}</Td>
                                <Td>{child.email}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <InviteUserModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            </Box>
        </Box>
    );
}

export default Users;
