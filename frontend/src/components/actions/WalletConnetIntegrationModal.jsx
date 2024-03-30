import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    GridItem,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ScaleFade,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Text,
    VStack,
    useColorModeValue,
    useSteps,
    useToast,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import wclogo from "../../img/walletconnect_logo.png";
import { useUser } from "../../providers/User";
import { useWalletConnect } from "../../providers/WalletConnect";
import networks from "../../utils/networks.json";
import { NETWORK_SOLANA } from "../../utils/networksolana";

const steps = [
    { id: "step-1", title: "WalletConnet URI", description: "Add WalletConnect Connection" },
    { id: "step-2", title: "Safe selection", description: "Select available safe(s)" },
    { id: "step-3", title: "Approval", description: "Approve terms" },
];

const StyledStepper = styled(Stepper)`
    line-height: 20px;
`;

export default function WalletConnectIntegrationModal({ isOpen, onClose }) {
    const {
        pair,
        ConnectionModal,
        handleApproveConnection,
        getNamespaceInfo,
        isGettingNamespaceInfoRef,
        requiredNamespaces,
        isPairingLoading,
        sessionProposal,
        resetConnectionStatus,
        namespaceInfoError,
        selectedSafes,
        setSelectedSafes,
        isApprovingSession,
    } = useWalletConnect();

    const { safes } = useUser();
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef();
    const bg = useColorModeValue("gray.100", "gray.700");
    const selectedBg = useColorModeValue("green.200", "green.700");
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (requiredNamespaces && sessionProposal) {
            setActiveStep(2);
        }
    }, [requiredNamespaces, isGettingNamespaceInfoRef, namespaceInfoError, sessionProposal, isApprovingSession]);

    const closeModal = () => {
        setInputValue("");
        setActiveStep(0);
        resetConnectionStatus();
        onClose();
    };

    const toggleSafeSelection = (safeAddress) => {
        const newSelectedSafeList = selectedSafes.includes(safeAddress)
            ? selectedSafes.filter((s) => s !== safeAddress)
            : [...selectedSafes, safeAddress];
        setSelectedSafes(newSelectedSafeList);
    };

    const handlePair = async () => {
        if (selectedSafes.length === 0) {
            // Check if no safes are selected
            toast({
                title: "No Safes Selected",
                description: "Please select at least one safe to pair.",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return; // Stop the function if no safes are selected
        }

        try {
            await pair({ uri: inputValue });
            // Assuming you want to do something with the selected safes here.
            // ...
            // setInputValue(""); // Reset input value after successful pairing
            // onClose(); // Close the modal on successful pairing
        } catch (error) {
            toast({
                description: `WalletConnect Pairing Error: ${error.message}`,
                position: "top",
                status: "error",
                isClosable: true,
            });
        }
    };

    const validateWallConnectUri = debounce(async (uri) => {
        await getNamespaceInfo({ uri });
    }, 500);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        validateWallConnectUri(e.target.value);
    };

    const renderAvailableNetworks = () => {
        if (!requiredNamespaces) {
            return;
        }
        const availableChains = [];
        Object.keys(requiredNamespaces).forEach((n) => {
            requiredNamespaces[n].chains.forEach((chainId) => {
                if (NETWORK_SOLANA[chainId]) {
                    availableChains.push(NETWORK_SOLANA[chainId]);
                } else {
                    const network = Object.entries(networks).find(([, value]) => value.eip === chainId);
                    availableChains.push(network[1]);
                }
            });
        });

        return availableChains.map((chain) => (
            <Flex key={chain.id} align="center" padding="4px 0">
                <Image boxSize="20px" marginRight="6px" src={chain.svg || ""} />
                <Text fontSize="sm">{chain.title}</Text>
            </Flex>
        ));
    };

    const renderSafes = () => {
        const groupedSafes = safes.reduce(
            (accumulator, safe) => {
                const isSafeAvailable = requiredNamespaces?.eip155?.chains.includes(safe.eip);
                if (isSafeAvailable) {
                    accumulator.available.push(safe);
                } else {
                    accumulator.unavailable.push(safe);
                }

                return accumulator;
            },
            { available: [], unavailable: [] },
        );

        return (
            <>
                {groupedSafes.available.length ? (
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                        {groupedSafes.available.map((safe) => (
                            <GridItem key={safe.safeAddress}>
                                <Box
                                    p={4}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="flex-start" // Align items to the start of the box
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    m={2}
                                    bg={selectedSafes.includes(safe.safeAddress) ? selectedBg : bg}
                                    cursor="pointer"
                                    onClick={() => toggleSafeSelection(safe.safeAddress)}
                                    width="180px" // Set a fixed width to accommodate the content
                                >
                                    <Image src={networks[safe.network].svg} boxSize="24px" mr={2} />
                                    <Text fontSize="sm" isTruncated>
                                        {safe.name || safe.safeAddress}
                                    </Text>
                                </Box>
                            </GridItem>
                        ))}
                    </Grid>
                ) : (
                    <Text>You don&apos;t have any safes on available networks.</Text>
                )}
                {groupedSafes.unavailable.length ? (
                    <>
                        <Text>Safes on different networks:</Text>
                        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                            {groupedSafes.unavailable.map((safe) => (
                                <GridItem key={safe.safeAddress}>
                                    <Box
                                        p={4}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-start" // Align items to the start of the box
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        m={2}
                                        bg={bg}
                                        cursor="not-allowed"
                                        width="180px" // Set a fixed width to accommodate the content
                                    >
                                        <Image src={networks[safe.network].svg} boxSize="24px" mr={2} />
                                        <Text fontSize="sm" isTruncated>
                                            {safe.name || safe.safeAddress}
                                        </Text>
                                    </Box>
                                </GridItem>
                            ))}
                        </Grid>
                    </>
                ) : null}
            </>
        );
    };

    const metadataConnection = sessionProposal?.params?.proposer?.metadata;

    const renderStepOne = () => (
        <ScaleFade in>
            <Flex direction="column" align="center" p={4} height="100%">
                <VStack spacing={3}>
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleChange}
                        placeholder="Enter WalletConnect URI"
                        size="md"
                        w="300px"
                    />
                    {namespaceInfoError && (
                        <Box>
                            <Text>{namespaceInfoError}</Text>
                        </Box>
                    )}
                </VStack>
            </Flex>
        </ScaleFade>
    );

    const renderStepTwo = () => (
        <ScaleFade in initialScale={0} reverse={false}>
            <Center>
                <Box>
                    <Flex direction="column" align="start" height="100%">
                        <VStack spacing={3}>
                            <Text>Select available safe(s) on the following networks:</Text>
                            {renderAvailableNetworks()}
                            {renderSafes()}
                        </VStack>
                    </Flex>
                </Box>
            </Center>
        </ScaleFade>
    );

    const renderStepThree = () => (
        <ScaleFade in initialScale={0}>
            <VStack direction="row">
                <Text fontSize="lg" fontWeight="bold">
                    Connect to
                </Text>
                <Text maxWidth="350">{metadataConnection?.name || "Dapp"}</Text>
                <Image
                    src={metadataConnection?.icons?.[0] || "https://avatars.githubusercontent.com/u/37784886"}
                    alt="Wallet Icon"
                    boxSize="50px"
                    my="4"
                />
            </VStack>
        </ScaleFade>
    );

    const renderCurrentStepBody = (step) => {
        switch (step) {
            case 0:
                return renderStepOne();
            case 1:
                return renderStepTwo();
            case 2:
                return renderStepThree();
            default:
        }
    };

    const goToNextStep = async () => {
        const nextStep = activeStep < steps.length ? activeStep + 1 : activeStep;
        if (activeStep !== 0) {
            setActiveStep(nextStep);
        } else if (requiredNamespaces) {
            setActiveStep(nextStep);
        }
    };

    const goToPreviousStep = () => {
        const prevStep = activeStep > 0 ? activeStep - 1 : 0;
        if (prevStep === 0) {
            setSelectedSafes([]);
        }
        setActiveStep(prevStep);
    };

    const disabledNextStep = () => {
        if (activeStep === 0 && (!inputValue || !requiredNamespaces || namespaceInfoError)) {
            return true;
        }
        if (activeStep === 1 && !selectedSafes.length) {
            return true;
        }
        return false;
    };

    const renderCurrentStepFooter = (step) => {
        if (step === 0) {
            return (
                <ModalFooter>
                    <Button mr={3} onClick={goToPreviousStep} isDisabled>
                        Previous
                    </Button>
                    <Button
                        onClick={goToNextStep}
                        isLoading={isGettingNamespaceInfoRef.current.loading}
                        loadingText="Veryfing uri"
                        isDisabled={disabledNextStep()}
                        colorScheme="blueSwatch"
                    >
                        Next
                    </Button>
                </ModalFooter>
            );
        }
        if (step === 1) {
            return (
                <ModalFooter>
                    <Button mr={3} onClick={goToPreviousStep}>
                        Previous
                    </Button>
                    <Button
                        onClick={handlePair}
                        isLoading={isPairingLoading}
                        loadingText="Connecting"
                        colorScheme="blueSwatch"
                    >
                        Connect
                    </Button>
                </ModalFooter>
            );
        }
        if (step === 2) {
            return (
                <ModalFooter>
                    <Button mr={3} onClick={goToPreviousStep}>
                        Previous
                    </Button>
                    <Button
                        onClick={() => handleApproveConnection(closeModal)}
                        isLoading={isApprovingSession}
                        colorScheme="blueSwatch"
                    >
                        Approve
                    </Button>
                </ModalFooter>
            );
        }
    };

    return (
        <Flex direction="column" align="start" p={4} height="100%">
            <Modal isOpen={isOpen} onClose={closeModal}>
                <ModalOverlay />
                <ModalContent minWidth="800px">
                    <ModalHeader alignItems="center">
                        <Center>
                            <Image src={wclogo} alt="WalletConnect Logo" mb={4} mt={4} width="200px" />
                        </Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <StyledStepper index={activeStep} size="sm" mb={5}>
                            {steps.map((step) => (
                                <Step key={step.id}>
                                    <StepIndicator>
                                        <StepStatus
                                            complete={<StepIcon />}
                                            incomplete={<StepNumber />}
                                            active={<StepNumber />}
                                        />
                                    </StepIndicator>

                                    <Box flexShrink="0">
                                        <StepTitle>{step.title}</StepTitle>
                                        <StepDescription>{step.description}</StepDescription>
                                    </Box>

                                    <StepSeparator />
                                </Step>
                            ))}
                        </StyledStepper>
                        <Box minHeight="150">{renderCurrentStepBody(activeStep)}</Box>
                    </ModalBody>
                    {renderCurrentStepFooter(activeStep)}
                </ModalContent>
            </Modal>
            {ConnectionModal}
        </Flex>
    );
}

WalletConnectIntegrationModal.propTypes = {
    isOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
