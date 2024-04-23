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
    Flex,
    Link,
    Text,
    Stack,
    useColorModeValue,
    useStyleConfig,
    useToast,
} from "@chakra-ui/react";
import { upperFirst } from "lodash";
import { IoCheckmarkOutline, IoCloseOutline, IoPlayOutline, IoOpenOutline } from "react-icons/io5";
import { useWagmi } from "../providers/Wagmi";
import useGnosisSafe from "../hooks/useGnosisSafe";
import networks from "../utils/networks.json";
import TransactionDetails from "./TransactionDetails";
import CopyToClipboard from "./CopyToClipboard";

function Transaction({ transaction }) {
    const { chain, chains, metaMaskInstalled, switchNetwork, address, walletMismatch } = useWagmi();
    const { getSafeService, confirmTransaction, executeTransaction, rejectTransaction } = useGnosisSafe();
    const [executing, setExecuting] = useState(false);
    const [executed, setExecuted] = useState(false);
    const [rejected, setRejected] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [approved, setApproved] = useState(false);
    const [approving, setApproving] = useState(false);
    const backgroundColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const codeBackground = useColorModeValue("gray.100", "none");
    const accordionStyles = useStyleConfig("Accordion");
    const toast = useToast();

    const networkMismatch =
        chain &&
        transaction.network &&
        (transaction.network === "mainnet" ? chain.network !== "homestead" : chain.network !== transaction.network);

    const approve = async (network, safeAddress, safeTxHash) => {
        setApproving(true);
        const safeService = await getSafeService(network);
        const success = await confirmTransaction(safeService, safeAddress, safeTxHash);
        if (success) {
            toast({
                description: "Transaction approved successfully! Please await status update.",
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setApproved(true);
        }
        setApproving(false);
    };

    const execute = async (network, safeAddress, safeTxHash) => {
        setExecuting(true);
        const safeService = await getSafeService(network);
        const success = await executeTransaction(safeService, safeAddress, safeTxHash);
        if (success) {
            toast({
                description: "Transaction executed successfully! Please await updates for any pending transactions.",
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setExecuted(true);
        }
        setExecuting(false);
    };

    const reject = async (network, safeAddress, nonce) => {
        setRejecting(true);
        const success = await rejectTransaction(network, safeAddress, nonce, address);
        if (success) {
            toast({
                description: "Rejection transaction created successfully! Please await status update.",
                position: "top",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setRejected(true);
        }
        setRejecting(false);
    };

    const formatDate = (date) => {
        const currentDate = new Date();
        const targetDate = new Date(date);
        const isCurrentYear = targetDate.getFullYear() === currentDate.getFullYear();

        // Check if the target date is today
        if (targetDate.toDateString() === currentDate.toDateString()) {
            const timeString = targetDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return `Today ${timeString}`;
        }

        // Check if the target date is yesterday
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        if (targetDate.toDateString() === yesterday.toDateString()) {
            const timeString = targetDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return `Yesterday ${timeString}`;
        }

        // Check if the date is within the last week
        const weekAgo = new Date(currentDate);
        weekAgo.setDate(currentDate.getDate() - 7);
        if (targetDate > weekAgo && targetDate < currentDate) {
            const dayOfWeek = targetDate.toLocaleDateString("en-US", { weekday: "long" });
            const timeString = targetDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return `${dayOfWeek} ${timeString}`;
        }

        // For other dates, use the previous formatting
        const dateString = targetDate.toLocaleDateString("en-US", {
            year: isCurrentYear ? undefined : "numeric",
            month: "short",
            day: "numeric",
        });

        const timeString = targetDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${dateString} at ${timeString}`;
    };

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
        const isExecuteDisabled = walletMismatch || !address || !metaMaskInstalled || executed;
        const isApproveRejectDisabled =
            walletMismatch ||
            !address ||
            !metaMaskInstalled ||
            transaction.isExecuted ||
            transaction.executionDate ||
            rejected ||
            approved;

        const alreadyApproved =
            transaction.confirmations &&
            transaction.confirmations.length > 0 &&
            transaction.confirmations.some((c) => c.owner === address);

        return (
            <Flex direction="row" justifyContent="center" alignItems="center" gap="2" wrap="wrap" paddingBottom="5px">
                {transaction &&
                transaction.confirmations &&
                transaction.confirmationsRequired === transaction.confirmations.length ? (
                    <Button
                        as={Text}
                        variant="outline"
                        colorScheme={networkMismatch ? "bronzeSwatch" : "blueSwatch"}
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
                            {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) ||
                                (executed && "Executed") ||
                                "Execute"}
                        </Text>
                    </Button>
                ) : (
                    <Button
                        as={Text}
                        variant="outline"
                        colorScheme={networkMismatch ? "bronzeSwatch" : "blueSwatch"}
                        size="sm"
                        isLoading={approving}
                        loadingText="Approving..."
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
                            {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) ||
                                (approved && "Approved") ||
                                (alreadyApproved && "You approved") ||
                                "Approve"}
                        </Text>
                    </Button>
                )}

                <Button
                    as={Text}
                    variant="outline"
                    colorScheme={networkMismatch ? "bronzeSwatch" : "red"}
                    size="sm"
                    isLoading={rejecting}
                    loadingText="Rejecting..."
                    rightIcon={<IoCloseOutline />}
                    isDisabled={isApproveRejectDisabled}
                    onClick={(event) => {
                        event.preventDefault();
                        if (networkMismatch) {
                            switchNetwork(correctChain.id);
                        } else if (!isApproveRejectDisabled) {
                            reject(transaction.network, transaction.safe, transaction.nonce, address);
                        }
                    }}
                >
                    <Text as="span" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                        {(networkMismatch && `Switch to ${upperFirst(transaction.network)}`) ||
                            (rejected && "Rejected") ||
                            "Reject"}
                    </Text>
                </Button>
            </Flex>
        );
    };

    return (
        <Accordion allowMultiple backgroundColor={backgroundColor} borderRadius="5px">
            <AccordionItem border="none">
                {({ isExpanded }) => (
                    <>
                        <Stack direction="row" justify="space-between" gap="0">
                            <AccordionButton
                                borderRadius={isExpanded ? "5px 5px 0 0" : "5px"}
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
                                    direction="column"
                                    flexGrow="1"
                                    flexBasis={["65%", "65%", "65%", "65%", "65%", "60%"]}
                                >
                                    <Stack direction="row">
                                        <Stack direction="column" minWidth="250px">
                                            <Stack direction="row" p="5px" alignItems="center">
                                                <Image
                                                    boxSize="24px"
                                                    src={networks[transaction.network.toLowerCase()].svg}
                                                />
                                                <Text fontSize="sm" fontWeight="bold">
                                                    {transaction.network}
                                                </Text>
                                                <Text
                                                    textAlign="left"
                                                    width="100%"
                                                    fontSize="xs"
                                                    ml="5px"
                                                    mt="2px"
                                                    textOverflow="ellipsis"
                                                    whiteSpace="nowrap"
                                                    overflow="hidden"
                                                >
                                                    {formatDate(
                                                        transaction.unifiedDate ||
                                                            transaction.executionDate ||
                                                            transaction.submissionDate,
                                                    )}
                                                </Text>
                                            </Stack>
                                            <Stack direction="row" p="5px" alignItems="center">
                                                <Text fontSize="sm" pl="3px" fontWeight="bold">
                                                    Safe:
                                                </Text>
                                                <Box display="flex" alignItems="center" gap="1px">
                                                    <Text textAlign="left" fontSize="sm">
                                                        {transaction.safe.slice(0, 5)}...
                                                        {transaction.safe.slice(-4)}
                                                    </Text>
                                                    <CopyToClipboard
                                                        copy={transaction.safe}
                                                        tooltipSuffix="address"
                                                        size="21px"
                                                    />
                                                </Box>
                                            </Stack>
                                        </Stack>
                                        <Stack
                                            direction="column"
                                            spacing="4"
                                            fontSize="sm"
                                            width="100%"
                                            alignSelf="center"
                                        >
                                            <Flex direction="row" height="25px" alignItems="center">
                                                <Text fontWeight="bold" paddingRight="5px">
                                                    Status:
                                                </Text>
                                                <Text textAlign="left">
                                                    {transaction.txHash || transaction.transactionHash ? (
                                                        <Link
                                                            href={`${
                                                                networks[transaction.network.toLowerCase()].scanUrl
                                                            }/tx/${transaction.txHash || transaction.transactionHash}`}
                                                            color="blue3"
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
                                            <Flex direction="row">
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
                                                >
                                                    {(transaction?.satoshiData?.type &&
                                                        upperFirst(transaction?.satoshiData?.type)) ||
                                                        (transaction.dataDecoded?.method &&
                                                            upperFirst(transaction.dataDecoded?.method)) ||
                                                        (transaction.from && "Receive") ||
                                                        (transaction.to && Number(transaction.value) > 0 && "Send") ||
                                                        "Unspecified"}
                                                </Text>
                                            </Flex>
                                        </Stack>
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
