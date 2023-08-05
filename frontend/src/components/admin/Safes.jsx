import React, { useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useSafeBalance } from "../../providers/SafeBalance";
import { useUser } from "../../providers/User";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";

function Safes() {
    const { currentTeam } = useUser();
    const { safesPortfolio } = useSafeBalance();
    const [modalOpen, setModalOpen] = useState(false);

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    return (
        <Box padding="10px" minWidth="500px" margin="10px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" as="h2">
                        Safes
                    </Heading>
                    <Text>Manage the safes associated with your Satoshi Safe team</Text>
                </Box>
            </Flex>
            <Box>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Safe Address</Th>
                            <Th>Network</Th>
                            {/* <Th>Status</Th> */}
                            <Th>Total USD</Th>
                            {/* <Th>Actions</Th> */}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentTeam &&
                            currentTeam.safes.map((safe) => (
                                <Tr key={safe.safeAddress}>
                                    <Td>{safe.safeAddress}</Td>
                                    <Td>{safe.network}</Td>
                                    {/* <Td>{safe.status}</Td> */}
                                    <Td>
                                        {safesPortfolio && safesPortfolio[safe.safeAddress]
                                            ? `${formatter.format(safesPortfolio[safe.safeAddress].total_usd_value)}`
                                            : null}
                                    </Td>
                                    {/* <Td>{safe.owners.join(", ")}</Td> */}
                                    <Td>
                                        {/* <Button colorScheme="blue"
                                        onClick={() => generateJoinTransaction(safe)}>Join</Button>
                <Button colorScheme="yellow" onClick={() => generateLeaveTransaction(safe)}>Leave</Button>
                <Button colorScheme="green" onClick={() => addBotToSafe(safe)}>Add Bot</Button> */}
                                    </Td>
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
                    Add Satoshi Safe
                </Button>
                <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            </Box>
        </Box>
    );
}

export default Safes;
