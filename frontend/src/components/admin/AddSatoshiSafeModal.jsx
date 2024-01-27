import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Flex,
    Button,
    useColorModeValue,
    useToast,
    Td,
} from "@chakra-ui/react";
import { IoAddCircleOutline, IoEnterOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import { useTransactions } from "../../providers/Transactions";
import { db, doc, getDoc, updateDoc, Timestamp } from "../../firebase";
import ImportSafeModal from "./ImportSafeModal";
import CreateNewSafeModal from "./CreateNewSafeModal";

function AddSatoshiSafeModal({ isOpen, setIsOpen }) {
    const tableBorderColor = useColorModeValue("gray.100", "gray.600");
    const toast = useToast();
    const { currentTeam, setCurrentTeam, userTeamData } = useUser();
    const { fetchAndPostTransactions, setGettingData } = useTransactions();
    const [modalState, setModalState] = useState("welcome");
    const [checkedSafes, setCheckedSafes] = useState({});
    const [loading, setLoading] = useState(false);

    const onClose = () => {
        setIsOpen(false);
        setModalState("welcome");
        setCheckedSafes({});
    };

    const renderTd = (content, idx) => (
        <Td
            _firstLetter={{
                textTransform: "capitalize",
            }}
            borderColor={tableBorderColor}
            borderBottom={userTeamData.userSafes.length - 1 === idx ? "none" : "inherit"}
        >
            {content}
        </Td>
    );

    const handleCheckboxChange = (safeAddress) => {
        setCheckedSafes((prevState) => ({
            ...prevState,
            [safeAddress]: !prevState[safeAddress],
        }));
    };

    const importSafes = async () => {
        setLoading(true);

        const entries = Object.entries(checkedSafes);

        const newSafes = entries
            .filter(([, value]) => value === true)
            .map(([key]) => {
                const safeData = userTeamData.userSafes.find((safe) => safe.safeAddress === key);
                return { ...safeData, addedAt: Timestamp.now() };
            });

        if (newSafes.length > 0) {
            try {
                const teamRef = doc(db, "teams", currentTeam.id);
                const teamSnap = await getDoc(teamRef);
                const teamData = teamSnap.data();

                await updateDoc(teamRef, {
                    safes: [...(teamData?.safes || []), ...newSafes],
                });

                setCurrentTeam((prevState) => ({
                    ...prevState,
                    safes: [...(prevState?.safes || []), ...newSafes],
                }));
            } catch (error) {
                toast({
                    description: `Failed to update team safe: ${error.message}`,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                onClose();
                setLoading(false);
            }

            try {
                setGettingData(true);
                // Create an array of functions returning promises
                const transactionPromises = newSafes.map((teamSafe) => () => fetchAndPostTransactions(teamSafe, 5));
                // this is so werid: gnosis occasionally returns wrong results with limit more than 10

                // Function to execute promises sequentially
                const executeSequentially = (promises) =>
                    promises.reduce((prevPromise, nextPromise) => prevPromise.then(nextPromise), Promise.resolve());

                // Execute promises sequentially and wait for completion
                const allTransactionsComplete = executeSequentially(transactionPromises);

                // Use toast.promise with the promise
                toast.promise(
                    allTransactionsComplete, // Execute promises sequentially
                    {
                        loading: {
                            title: "Fetching Transactions",
                            description: "Task in progress... Please keep this tab open and wait for updates.",
                            position: "top",
                        },
                        success: {
                            title: "Transactions Fetched",
                            description: "Finished getting transactions for selected safe(s).",
                            position: "top",
                            isClosable: true,
                        },
                        error: {
                            title: "Error",
                            description: "Error getting transactions.",
                            position: "top",
                            isClosable: true,
                        },
                    },
                );

                // Await the completion of all transactions
                await allTransactionsComplete;
            } catch (error) {
                //
            } finally {
                setGettingData(false);
            }
        }
    };

    const importSafeContent = () => {
        if (modalState === "welcome") {
            return (
                <>
                    <ModalHeader>Welcome to Satoshi Safe</ModalHeader>
                    <ModalCloseButton top="var(--chakra-space-3)" />
                    <ModalBody paddingTop="0">
                        Satoshi Safe app utilizes multi-signature (multi-sig) wallets to enhance the safety of your
                        assets beyond what&apos;s offered by hot wallets like MetaMask, or even standalone hardware
                        wallets. You can start by either importing an existing Gnosis Safe or creating a new one.
                        <Flex padding="50px" justify="space-around">
                            <Button
                                colorScheme="green300"
                                size="lg"
                                leftIcon={<IoAddCircleOutline size="20px" />}
                                onClick={() => setModalState("new")}
                            >
                                Create New Safe
                            </Button>
                            <Button
                                colorScheme="green300"
                                size="lg"
                                leftIcon={<IoEnterOutline size="20px" />}
                                onClick={() => setModalState("import")}
                            >
                                Import Gnosis Safe
                            </Button>
                        </Flex>
                    </ModalBody>
                </>
            );
        }
        if (modalState === "import") {
            return (
                <ImportSafeModal
                    userTeamData={userTeamData}
                    setModalState={setModalState}
                    currentTeam={currentTeam}
                    checkedSafes={checkedSafes}
                    handleCheckboxChange={handleCheckboxChange}
                    importSafes={importSafes}
                    loading={loading}
                    onClose={onClose}
                    renderTd={renderTd}
                />
            );
        }
        if (modalState === "new") {
            return <CreateNewSafeModal onClose={onClose} setModalState={setModalState} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>{importSafeContent()}</ModalContent>
        </Modal>
    );
}

AddSatoshiSafeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};

export default AddSatoshiSafeModal;
