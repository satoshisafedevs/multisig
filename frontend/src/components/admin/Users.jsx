import { Box, Button, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoPersonAddOutline, IoPersonRemoveOutline, IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import InviteUserModal from "./InviteUserModal";
import RemoveUserModal from "./RemoveUserModal";

function Users() {
    const { filteredTeamUsersInfo, user, currentTeam } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState();
    const [sortAscending, setSortAscending] = useState(true);
    const hoverColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
    const iconStyle = { display: "inline", marginLeft: "5px", verticalAlign: "sub" };

    const sortedUsers = filteredTeamUsersInfo
        ? Object.entries(filteredTeamUsersInfo).sort(([, a], [, b]) => {
              if (sortAscending) {
                  return a.displayName.localeCompare(b.displayName);
              }
              return b.displayName.localeCompare(a.displayName);
          })
        : [];

    const isTeamAdmin = currentTeam.ownerId === user.uid;

    return (
        <Box padding="10px" minWidth="500px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Users
                    </Heading>
                    <Text>Manage the users associated with the team.</Text>
                </Box>
                <Button
                    rightIcon={<IoPersonAddOutline size="20px" />}
                    colorScheme="blueSwatch"
                    onClick={() => setModalOpen(true)}
                    alignSelf="flex-start"
                >
                    Invite user
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
                                Name
                                {sortAscending ? (
                                    <IoChevronUpOutline size="15px" style={iconStyle} />
                                ) : (
                                    <IoChevronDownOutline size="15px" style={iconStyle} />
                                )}
                            </Th>
                            <Th>Email</Th>
                            {isTeamAdmin && sortedUsers.length > 1 && <Th>Actions</Th>}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedUsers.map(([id, child]) => (
                            <Tr key={child.email || child.displayName} style={{ fontVariantNumeric: "normal" }}>
                                <Td>{child.displayName}</Td>
                                <Td>{child.email}</Td>
                                {isTeamAdmin && sortedUsers.length > 1 && user.email !== child.email && (
                                    <Td>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            colorScheme="red"
                                            rightIcon={<IoPersonRemoveOutline size="14px" />}
                                            onClick={() => {
                                                setRemoveUserModalOpen(true);
                                                setUserToRemove({ ...child, id });
                                            }}
                                        >
                                            Remove user
                                        </Button>
                                    </Td>
                                )}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <InviteUserModal isOpen={modalOpen} setIsOpen={setModalOpen} />
                <RemoveUserModal
                    isOpen={removeUserModalOpen}
                    setIsOpen={setRemoveUserModalOpen}
                    user={userToRemove}
                    setUserToRemove={setUserToRemove}
                />
            </Box>
        </Box>
    );
}

export default Users;
