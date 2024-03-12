/* eslint-disable react/forbid-prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import {
    ModalHeader,
    ModalBody,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Td,
    Tbody,
    Alert,
    Stack,
    ModalFooter,
    Button,
    AlertIcon,
    ModalCloseButton,
    useColorModeValue,
    Tooltip,
    Checkbox,
    Spinner,
    useToast,
} from "@chakra-ui/react";
import { IoChevronBackOutline } from "react-icons/io5";
import useGnosisSafe from "../../hooks/useGnosisSafe";

function ImportSafeModal({
    userTeamData,
    setModalState,
    currentTeam,
    checkedSafes,
    handleCheckboxChange,
    importSafes,
    loading,
    onClose,
    renderTd,
}) {
    const tableBorderColor = useColorModeValue("gray.100", "gray.600");
    const StyledButton = styled(Button)`
        span {
            margin-inline-end: 3px;
        }
    `;
    const { refreshSafeList } = useGnosisSafe();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const toast = useToast();

    // Updated function to handle asynchronous refresh list
    const handleRefreshList = async () => {
        setIsRefreshing(true);

        const resp = await refreshSafeList({ walletAddress: userTeamData.userWalletAddress });
        if (resp) {
            toast({
                description: "Safes list has been successfully refreshed.",
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }

        setIsRefreshing(false);
    };
    return (
        <>
            <ModalHeader>Import Gnosis Safe</ModalHeader>
            <ModalCloseButton top="var(--chakra-space-3)" />
            <ModalBody paddingTop="0">
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
                                                <Tooltip placement="top" label={isAddressInSafes && "Already imported"}>
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
                    <>
                        <Alert status="warning" marginTop="20px" borderRadius="var(--chakra-radii-base)">
                            <AlertIcon />
                            It appears that you don&apos;t have a Gnosis Safe(s) associated with your wallet.
                        </Alert>
                        {/* <Button
                            marginTop="20px"
                            colorScheme="blue"
                            onClick={() => refreshSafeList({ walletAddress: userTeamData.userWalletAddress })}
                        >
                            Refresh list
                        </Button> */}
                    </>
                )}
            </ModalBody>

            <ModalFooter justifyContent="space-between">
                <StyledButton
                    leftIcon={<IoChevronBackOutline size="18px" margin="0" />}
                    onClick={() => setModalState("welcome")}
                >
                    Back
                </StyledButton>
                <Stack direction="row" spacing={4}>
                    <Button onClick={handleRefreshList} isLoading={isRefreshing} spinner={<Spinner size="sm" />}>
                        Refresh list
                    </Button>
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
        </>
    );
}

ImportSafeModal.propTypes = {
    userTeamData: PropTypes.object.isRequired,
    setModalState: PropTypes.func.isRequired,
    currentTeam: PropTypes.object.isRequired,
    checkedSafes: PropTypes.object.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    importSafes: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    renderTd: PropTypes.func.isRequired,
};

export default ImportSafeModal;
