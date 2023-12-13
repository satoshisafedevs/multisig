import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Button, useToast } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useUser } from "../../providers/User";
import { db, doc, getDoc, updateDoc } from "../../firebase";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";
import SafeDetails from "./SafeDetails";

function Safes() {
    const toast = useToast();
    const { currentTeam, setCurrentTeam } = useUser();
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const getSafeData = async (safe, network, signal) => {
        try {
            const response = await fetch(`https://safe-transaction-${network}.safe.global/api/v1/safes/${safe}/`, {
                signal,
            });
            return { [safe]: await response.json() };
        } catch (e) {
            return {};
        }
    };

    const fetchAndUpdateLatestSafesData = async (controller) => {
        try {
            let isUpdateNeeded = false;
            const fetchedDataList = await Promise.all(
                currentTeam.safes.map((safe) => getSafeData(safe.safeAddress, safe.network, controller.signal)),
            );
            const combinedData = fetchedDataList.reduce((acc, currData) => ({ ...acc, ...currData }), {});
            const teamRef = doc(db, "teams", currentTeam.id);
            const teamSnap = await getDoc(teamRef);
            const teamData = teamSnap.data();

            const latestSafesData = teamData.safes.map((safe) => {
                const key = Object.keys(combinedData).find((el) => el === safe.safeAddress);
                if (key) {
                    if (
                        JSON.stringify(safe.owners) !== JSON.stringify(combinedData[key].owners) ||
                        safe.threshold !== combinedData[key].threshold
                    ) {
                        isUpdateNeeded = true;
                    }
                    return {
                        ...safe,
                        owners: combinedData[key].owners,
                        threshold: combinedData[key].threshold,
                    };
                }
                return safe;
            });
            if (Object.keys(combinedData).length) {
                if (isUpdateNeeded) {
                    await updateDoc(teamRef, {
                        safes: latestSafesData,
                    });
                    setCurrentTeam((prevState) => ({
                        ...prevState,
                        safes: latestSafesData,
                    }));
                    console.log("Updated safes data");
                }
                setLoading(false);
            }
        } catch (error) {
            toast({
                description: `Failed to sync safes data: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (currentTeam?.safes?.length > 0) {
            const controller = new AbortController();
            fetchAndUpdateLatestSafesData(controller);
            return () => controller.abort();
        }
    }, [currentTeam?.safes]);

    return (
        <Box padding="10px" minWidth="500px">
            <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
            <Flex justifyContent="space-between" alignItems="center" marginBottom="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Safes
                    </Heading>
                    <Text>Manage the safes associated with your Satoshi Safe team</Text>
                </Box>
                <Button
                    leftIcon={<IoAdd size="25px" />}
                    colorScheme="green300"
                    onClick={() => setModalOpen(true)}
                    alignSelf="flex-start"
                >
                    Add Satoshi Safe
                </Button>
            </Flex>
            {currentTeam?.safes?.map((safe) => (
                <SafeDetails
                    key={safe.safeAddress}
                    data={safe}
                    loading={loading}
                    fetchAndUpdateLatestSafesData={fetchAndUpdateLatestSafesData}
                />
            ))}
        </Box>
    );
}

export default Safes;
