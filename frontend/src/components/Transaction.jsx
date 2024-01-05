import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Button,
    Code,
    Image,
    Link,
    Flex,
    Text,
    Stack,
    useColorModeValue,
    useStyleConfig,
    useToast,
} from "@chakra-ui/react";
import { upperFirst } from "lodash";
import { IoCheckmarkOutline, IoCloseOutline, IoOpenOutline, IoPlayOutline } from "react-icons/io5";
import { useWagmi } from "../providers/Wagmi";
import useGnosisSafe from "../hooks/useGnosisSafe";
import networks from "../utils/networks.json";
import TransactionDetails from "./TransactionDetails";
import CopyToClipboard from "./CopyToClipboard";

function Transaction({ transaction }) {
    const { chain, chains, metaMaskInstalled, switchNetwork, address, walletMismatch } = useWagmi();
    const { getSafeService, confirmTransaction, executeTransaction } = useGnosisSafe();
    const [executing, setExecuting] = useState(false);
    const [executed, setExecuted] = useState(false);
    const backgroundColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const codeBackground = useColorModeValue("gray.100", "none");
    const responsiveStyles = ["column", "column", "column", "column", "column", "row"];
    const accordionStyles = useStyleConfig("Accordion");
    const toast = useToast();

    const networkMismatch =
        chain &&
        (transaction.network === "mainnet" ? chain.network !== "homestead" : chain.network !== transaction.network);

    const approve = async (network, safeAddress, safeTxHash) => {
        const safeService = await getSafeService(network);
        confirmTransaction(safeService, safeAddress, safeTxHash);
    };

    const execute = async (network, safeAddress, safeTxHash) => {
        setExecuting(true);
        const safeService = await getSafeService(network);
        const success = await executeTransaction(safeService, safeAddress, safeTxHash);
        if (success) {
            toast({
                description:
                    "Transaction executed successfully! " +
                    "Please await the status update or refresh the page in one minute.",
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setExecuted(true);
        }
        setExecuting(false);
    };

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

    const showButtons = () => {
        const correctChain = chains.find((el) => {
            // Check if the network is 'mainnet' and the el.network is 'homestead'
            if (transaction.network === "mainnet") {
                return el.network === "homestead";
            }
            // For other networks, just match the el.network with the given network
            return el.network === transaction.network;
        });

        if (transaction.txHash || transaction.transactionHash || executed) {
            return null;
        }
        if (transaction.confirmationsRequired === transaction.confirmations.length) {
            const isExecuteDisabled = walletMismatch || !address || !metaMaskInstalled;

            return (
                <Stack
                    spacing="4"
                    direction="column"
                    flex="1"
                    justifyContent="center"
                    alignSelf="center"
                    maxWidth="35%"
                >
                    <Button
                        as={Text}
                        variant="outline"
                        colorScheme={networkMismatch ? "orange" : "green300"}
                        size="sm"
                        isLoading={executing}
                        loadingText="Executing..."
                        rightIcon={<IoPlayOutline />}
                        isDisabled={isExecuteDisabled}
                        onClick={(event) => {
                            event.preventDefault();
                            if (networkMismatch) {
                                switchNetwork(correctChain.id);
                            } else if (!isExecuteDisabled) {
                                execute(transaction.network, transaction.safe, transaction.safeTxHash);
                            }
                        }}
                    >
                        <Text as="span" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                            {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) || "Execute"}
                        </Text>
                    </Button>
                </Stack>
            );
        }

        const isApproveRejectDisabled =
            walletMismatch || !address || !metaMaskInstalled || transaction.isExecuted || transaction.executionDate;

        const alreadyApproved =
            transaction.confirmations &&
            transaction.confirmations.length > 0 &&
            transaction.confirmations.some((c) => c.owner === address);

        return (
            <Stack spacing="4" direction="column" flex="1" justifyContent="center" alignSelf="center" maxWidth="35%">
                <Button
                    as={Text}
                    variant="outline"
                    colorScheme={networkMismatch ? "orange" : "red"}
                    size="sm"
                    rightIcon={<IoCloseOutline />}
                    isDisabled={isApproveRejectDisabled}
                    onClick={(event) => {
                        event.preventDefault();
                        if (networkMismatch) {
                            switchNetwork(correctChain.id);
                        }
                    }}
                >
                    <Text as="span" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                        {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) || "Reject"}
                    </Text>
                </Button>
                <Button
                    as={Text}
                    variant="outline"
                    colorScheme={networkMismatch ? "orange" : "green300"}
                    size="sm"
                    rightIcon={<IoCheckmarkOutline />}
                    isDisabled={isApproveRejectDisabled || alreadyApproved}
                    onClick={(event) => {
                        event.preventDefault();
                        if (networkMismatch) {
                            switchNetwork(correctChain.id);
                        } else if (!isApproveRejectDisabled) {
                            approve(transaction.network, transaction.safe, transaction.safeTxHash);
                        }
                    }}
                >
                    <Text as="span" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                        {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) || "Approve"}
                    </Text>
                </Button>
            </Stack>
        );
    };

    return (
        <Accordion allowMultiple backgroundColor={backgroundColor} borderRadius="5px">
            <AccordionItem border="none">
                {({ isExpanded }) => (
                    <>
                        <Stack direction="row" justify="space-between" gap="0">
                            <AccordionButton
                                width="initial"
                                padding="5px 0 5px 10px"
                                flexBasis={["65%", "65%", "65%", "65%", "65%", "60%"]}
                                flexGrow="1"
                                // eslint-disable-next-line no-underscore-dangle
                                _focusVisible={{ ...accordionStyles.button._focusVisible, borderRadius: "5px" }}
                                _hover={{
                                    ...accordionStyles.button._hover, // eslint-disable-line no-underscore-dangle
                                    borderRadius: isExpanded ? "5px 5px 0 0" : "5px",
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing="4"
                                    fontSize="sm"
                                    width="100%"
                                    justifyContent="space-between"
                                >
                                    <Flex direction="column" align="center" justify="space-evenly">
                                        <Image boxSize="24px" src={networks[transaction.network.toLowerCase()].icon} />
                                        <Text fontSize="xs" fontWeight="bold">
                                            {transaction.network}
                                        </Text>
                                    </Flex>
                                    <Stack spacing="2" alignSelf="center" flex="1">
                                        <Flex direction={responsiveStyles} alignItems="baseline">
                                            <Text fontWeight="bold" paddingRight="5px">
                                                Safe:
                                            </Text>
                                            <Box display="flex" alignItems="center" gap="1px">
                                                <Text textAlign="left">
                                                    {transaction.safe.slice(0, 5)}...
                                                    {transaction.safe.slice(-4)}
                                                </Text>
                                                <CopyToClipboard
                                                    copy={transaction.safe}
                                                    tooltipSuffix="address"
                                                    size="21px"
                                                />
                                            </Box>
                                        </Flex>
                                        {(transaction.nonce || transaction.nonce === 0) && (
                                            <Flex direction={responsiveStyles} alignItems="baseline">
                                                {(transaction.nonce || transaction.nonce === 0) && (
                                                    <>
                                                        <Text fontWeight="bold" paddingRight="5px">
                                                            Nonce:
                                                        </Text>
                                                        <Text textAlign="left">
                                                            {JSON.stringify(transaction.nonce)}
                                                        </Text>
                                                    </>
                                                )}
                                            </Flex>
                                        )}
                                    </Stack>
                                    <Stack
                                        spacing="2"
                                        flex="1.2"
                                        alignSelf="center"
                                        textOverflow="ellipsis"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                    >
                                        <Flex direction={responsiveStyles} alignItems="baseline">
                                            <Text fontWeight="bold" paddingRight="5px">
                                                Status:
                                            </Text>
                                            <Text textAlign="left">
                                                {transaction.txHash || transaction.transactionHash ? (
                                                    <Link
                                                        href={`${
                                                            networks[transaction.network.toLowerCase()].scanUrl
                                                        }/tx/${transaction.txHash || transaction.transactionHash}`}
                                                        color="green300.500"
                                                        isExternal
                                                        display="flex"
                                                        alignItems="center"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            window.open(
                                                                event.target.href,
                                                                "_blank",
                                                                "noopener,noreferrer",
                                                            );
                                                        }}
                                                    >
                                                        Executed <IoOpenOutline style={{ paddingLeft: "3px" }} />
                                                    </Link>
                                                ) : (
                                                    "Pending"
                                                )}
                                            </Text>
                                        </Flex>
                                        <Flex direction={responsiveStyles} alignItems="baseline">
                                            <Text fontWeight="bold" paddingRight="5px">
                                                Action:
                                            </Text>
                                            <Text
                                                textAlign="left"
                                                alignSelf="center"
                                                textOverflow="ellipsis"
                                                whiteSpace="nowrap"
                                                overflow="hidden"
                                                width="100%"
                                                paddingRight="10px"
                                            >
                                                {(transaction.dataDecoded?.method &&
                                                    capitalize(transaction.dataDecoded?.method)) ||
                                                    (transaction.from && "Receive") ||
                                                    (transaction.to && transaction.value > 0 && "Send") ||
                                                    "Unspecified"}
                                            </Text>
                                        </Flex>
                                    </Stack>
                                    {showButtons()}
                                </Stack>
                                <AccordionIcon margin="10px" />
                            </AccordionButton>
                        </Stack>
                        <AccordionPanel padding="0px">
                            <Code background={codeBackground} width="100%" padding="10px">
                                <TransactionDetails transaction={transaction} />
                            </Code>
                        </AccordionPanel>
                    </>
                )}
            </AccordionItem>
        </Accordion>
    );
}

Transaction.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    transaction: PropTypes.any,
};

export default memo(Transaction);
