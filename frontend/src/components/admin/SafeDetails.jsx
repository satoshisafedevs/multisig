import React, { useState, memo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Divider,
    Input,
    Flex,
    Heading,
    Button,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { IoRemoveCircleOutline, IoHelpCircleOutline } from "react-icons/io5";
import { BsSafe } from "react-icons/bs";
import { db, doc, getDoc, updateDoc } from "../../firebase";
import { useUser } from "../../providers/User";
import { formatTimestamp } from "../../utils";
import SafeStatus from "./SafeStatus";

function SafeDetails({ data, loading }) {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { currentTeam, setCurrentTeam, teamUsersInfo } = useUser();
    const [isEditingName, setIsEditingName] = useState(false);
    const [safeName, setSafeName] = useState(data.name || "");
    const bgValue = useColorModeValue("gray.50", "whiteAlpha.100");
    const cancelRef = useRef();

    const tooltipLabel = "Portfolio data tracking begins the following day of the added date.";

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                cancelRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        setIsEditingName(false);
        if (data.name !== safeName.trim()) {
            try {
                const teamRef = doc(db, "teams", currentTeam.id);
                const teamSnap = await getDoc(teamRef);
                const teamData = teamSnap.data();
                const newSafesData = teamData.safes.map((safe) => {
                    if (safe.safeAddress === data.safeAddress) {
                        return {
                            ...safe,
                            name: safeName.trim(),
                        };
                    }
                    return safe;
                });
                await updateDoc(teamRef, {
                    safes: newSafesData,
                });
                setCurrentTeam((prevState) => ({
                    ...prevState,
                    safes: newSafesData,
                }));
            } catch (error) {
                toast({
                    description: `Failed to update safe name: ${error.message}`,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const removeSafe = async (safeAddress) => {
        try {
            const teamRef = doc(db, "teams", currentTeam.id);
            const teamSnap = await getDoc(teamRef);
            const teamData = teamSnap.data();
            const safesAfterRemoval = teamData.safes.filter((safe) => safe.safeAddress !== safeAddress);
            await updateDoc(teamRef, {
                safes: safesAfterRemoval,
            });
            setCurrentTeam((prevState) => ({
                ...prevState,
                safes: safesAfterRemoval,
            }));
        } catch (error) {
            toast({
                description: `Failed to delete safe: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Accordion allowToggle>
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Remove safe</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to remove safe {data.safeAddress}? This cannot be undone and will reset
                        Portfolio data for this safe.
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            mr={3}
                            onClick={onClose}
                            ref={cancelRef}
                            _focus={{
                                boxShadow: "var(--chakra-shadows-outline)",
                                // stupid Chakra outline not working for button on focus
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={() => {
                                removeSafe(data.safeAddress);
                                onClose();
                            }}
                        >
                            Remove
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AccordionItem key={data.safeAddress} borderWidth={1} borderRadius="5px" marginBottom="15px">
                {({ isExpanded }) => (
                    <>
                        <AccordionButton padding="15px 10px">
                            <Flex width="100%" justify="space-between" align="center" gap="10px">
                                <Flex align="center" gap="20px">
                                    <AccordionIcon />
                                    <SafeStatus safe={data} teamUsersInfo={teamUsersInfo} />
                                </Flex>
                                <Flex flex="1" justify="center" align="center" gap="10px">
                                    <BsSafe size="25px" />
                                    <Heading size="xs">{data.name || data.safeAddress}</Heading>
                                </Flex>
                            </Flex>
                        </AccordionButton>
                        <AccordionPanel padding="0 15px" background={isExpanded && bgValue}>
                            <Divider />
                            <Flex justify="space-between" align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Name
                                </Heading>
                                <Flex flex="1" align="center" justify="center" marginLeft="80px">
                                    {isEditingName ? (
                                        <Input w="70%" value={safeName} onChange={(e) => setSafeName(e.target.value)} />
                                    ) : (
                                        safeName || data.name || "(no name)"
                                    )}
                                </Flex>
                                <Tooltip label={loading && "Syncing with latest data..."}>
                                    <Button
                                        onClick={isEditingName ? handleSaveName : handleEditName}
                                        isDisabled={loading}
                                    >
                                        {isEditingName ? "Save" : "Edit"}
                                    </Button>
                                </Tooltip>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Safe address
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    {data.safeAddress}
                                </Box>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Owners
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    {data && data.owners && data.owners.map((owner) => <Box key={owner}>{owner}</Box>)}
                                </Box>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Network
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    {data.network}
                                </Box>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Manage
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    <Tooltip label={loading && "Syncing with latest data..."}>
                                        <Button
                                            colorScheme="red"
                                            variant="outline"
                                            isDisabled={loading}
                                            rightIcon={<IoRemoveCircleOutline />}
                                            onClick={onOpen}
                                        >
                                            Remove safe
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%">
                                    Threshold
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    {data.threshold}
                                </Box>
                            </Flex>
                            <Divider />
                            <Flex align="center" py={4}>
                                <Heading size="xs" flexBasis="15%" display="flex" alignItems="center" gap="5px">
                                    Added
                                    <Tooltip label={tooltipLabel}>
                                        {/* If you're wrapping an icon from react-icons, you need to also wrap the icon
                                         in a span element as react-icons icons do not use forwardRef. */}
                                        <span>
                                            <IoHelpCircleOutline size="20px" />
                                        </span>
                                    </Tooltip>
                                </Heading>
                                <Box flex="1" textAlign="center">
                                    {formatTimestamp(data.addedAt)}
                                </Box>
                            </Flex>
                        </AccordionPanel>
                    </>
                )}
            </AccordionItem>
        </Accordion>
    );
}

SafeDetails.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.any,
    loading: PropTypes.bool,
};

export default memo(SafeDetails);
