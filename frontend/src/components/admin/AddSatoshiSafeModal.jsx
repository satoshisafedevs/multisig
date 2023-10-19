import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import {
    Alert,
    AlertIcon,
    Checkbox,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Flex,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Tooltip,
    Button,
    Stack,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { IoAddCircleOutline, IoEnterOutline, IoChevronBackOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import { db, doc, getDoc, updateDoc, Timestamp } from "../../firebase";

function WelcomeModal({ isOpen, setIsOpen }) {
    const tableBorderColor = useColorModeValue("gray.100", "gray.600");
    const toast = useToast();
    const { currentTeam, setCurrentTeam, userTeamData } = useUser();
    const [importFlow, setImportFlow] = useState(false);
    const [checkedSafes, setCheckedSafes] = useState({});
    const [loading, setLoading] = useState(false);

    const StyledButton = styled(Button)`
        span {
            margin-inline-end: 3px;
        }
    `;

    const onClose = () => {
        setIsOpen(false);
        setImportFlow(false);
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
            }
        }
        onClose();
        setLoading(false);
    };
    const renderBody = () => {
        if (importFlow) {
            return (
                <>
                    Select the Safe(s) from the list below that you would like to import for this team.
                    {userTeamData?.userSafes?.length > 0 ? (
                        <TableContainer
                            marginTop="20px"
                            paddingTop="10px"
                            borderRadius="var(--chakra-radii-base)"
                            border="var(--chakra-borders-1px)"
                            borderColor={tableBorderColor}
                        >
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th borderColor={tableBorderColor} width="0" paddingRight="0" />
                                        <Th borderColor={tableBorderColor}>Address</Th>
                                        <Th borderColor={tableBorderColor}>Network</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {userTeamData.userSafes.map((safe, idx) => {
                                        const isAddressInSafes = (currentTeam.safes || []).some(
                                            (el) => el.safeAddress === safe.safeAddress,
                                        );
                                        return (
                                            <Tr key={safe.safeAddress}>
                                                <Td paddingRight="0">
                                                    <Tooltip
                                                        placement="top"
                                                        label={isAddressInSafes && "Already imported"}
                                                    >
                                                        <span>
                                                            <Checkbox
                                                                colorScheme="green300"
                                                                isChecked={
                                                                    checkedSafes[safe.safeAddress] || isAddressInSafes
                                                                }
                                                                isDisabled={isAddressInSafes}
                                                                onChange={() => handleCheckboxChange(safe.safeAddress)}
                                                            />
                                                        </span>
                                                    </Tooltip>
                                                </Td>
                                                {renderTd(safe.safeAddress, idx)}
                                                {renderTd(safe.network, idx)}
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert status="warning" marginTop="20px" borderRadius="var(--chakra-radii-base)">
                            <AlertIcon />
                            It appears that you don&apos;t have a Gnosis Safe associated with your wallet.
                        </Alert>
                    )}
                </>
            );
        }
        return (
            <>
                Satoshi Safe app utilizes multi-signature (multi-sig) wallets to enhance the safety of your assets
                beyond what&apos;s offered by hot wallets like MetaMask, or even standalone hardware wallets. You can
                start by either importing an existing Gnosis Safe or creating a new one.
                <Flex padding="50px" justify="space-around">
                    <Button isDisabled colorScheme="green300" size="lg" leftIcon={<IoAddCircleOutline size="20px" />}>
                        Create New Safe
                    </Button>
                    <Button
                        colorScheme="green300"
                        size="lg"
                        leftIcon={<IoEnterOutline size="20px" />}
                        onClick={() => setImportFlow(true)}
                    >
                        Import Gnosis Safe
                    </Button>
                </Flex>
            </>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{importFlow ? "Import Gnosis Safe" : "Welcome to Satoshi Safe"}</ModalHeader>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalBody paddingTop="0">{renderBody()}</ModalBody>
                {importFlow && (
                    <ModalFooter justifyContent="space-between">
                        <StyledButton
                            leftIcon={<IoChevronBackOutline size="18px" margin="0" />}
                            onClick={() => setImportFlow(false)}
                        >
                            Back
                        </StyledButton>
                        <Stack direction="row" spacing={4}>
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green300"
                                onClick={importSafes}
                                isLoading={loading}
                                isDisabled={
                                    userTeamData?.userSafes?.length === 0 ||
                                    !Object.values(checkedSafes).some((value) => value === true)
                                }
                            >
                                Let&apos;s go
                            </Button>
                        </Stack>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
}

WelcomeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};

export default WelcomeModal;
