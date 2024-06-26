import React, { useState, useEffect } from "react";
import { Alert, AlertIcon, Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";
import SafeDetails from "./SafeDetails";

function Safes() {
    const { fetchAndUpdateLatestSafesData, safes } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getSafes() {
            await fetchAndUpdateLatestSafesData();
            setLoading(false);
        }
        getSafes();
    }, []);

    return (
        <Box padding="10px" minWidth="500px">
            <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            <Flex justifyContent="space-between" alignItems="center" marginBottom="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Safes
                    </Heading>
                    <Text>Manage the safes associated with your Satoshi Safe team.</Text>
                </Box>
                <Button
                    rightIcon={<IoAddCircleOutline size="25px" />}
                    colorScheme="blueSwatch"
                    onClick={() => setModalOpen(true)}
                    alignSelf="flex-start"
                >
                    Add Satoshi Safe
                </Button>
            </Flex>
            {safes.map((safe) => (
                <SafeDetails
                    key={safe.safeAddress}
                    data={safe}
                    loading={loading}
                    fetchAndUpdateLatestSafesData={fetchAndUpdateLatestSafesData}
                />
            ))}
            {safes.length < 1 && (
                <Alert status="info" colorScheme="blueSwatch" borderRadius="var(--chakra-radii-base)">
                    <AlertIcon />
                    This team has no safes yet.
                </Alert>
            )}
        </Box>
    );
}

export default Safes;
