import React, { memo } from "react";
import PropTypes from "prop-types";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Button,
    Code,
    Image,
    Link,
    Flex,
    Text,
    Stack,
    useColorModeValue,
} from "@chakra-ui/react";
import { IoCheckmarkOutline, IoCloseOutline, IoOpenOutline, IoPlayOutline } from "react-icons/io5";
import useGnosisSafe from "../hooks/useGnosisSafe";
import networks from "./admin/networks.json";
import TransactionDetails from "./TransactionDetails";

function Transaction({ transaction, address, walletMismatch }) {
    const { getSafeService, confirmTransaction, executeTransaction } = useGnosisSafe();
    const backgroundColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const codeBackground = useColorModeValue("gray.100", "none");
    const responsiveStyles = ["column", "column", "column", "column", "column", "row"];

    // function weiToEth(wei) {
    //     const ETH_IN_WEI = 1e18;
    //     return wei / ETH_IN_WEI;
    // }

    const approve = async (network, safeAddress, safeTxHash) => {
        const safeService = await getSafeService(network);
        confirmTransaction(safeService, safeAddress, safeTxHash);
    };

    const execute = async (network, safeAddress, safeTxHash) => {
        const safeService = await getSafeService(network);
        executeTransaction(safeService, safeAddress, safeTxHash);
    };

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

    const showButtons = () => {
        if (transaction.txHash || transaction.transactionHash) {
            return null;
        }
        if (transaction.confirmationsRequired === transaction.confirmations.length) {
            return (
                <Stack spacing="4" direction={responsiveStyles} flex="1" justifyContent="center" alignSelf="center">
                    <Button
                        as={Text}
                        variant="outline"
                        colorScheme="green300"
                        size="sm"
                        rightIcon={<IoPlayOutline />}
                        isDisabled={walletMismatch || !address}
                        onClick={(event) => {
                            event.preventDefault();
                            execute(transaction.network, transaction.safe, transaction.safeTxHash);
                        }}
                    >
                        Execute
                    </Button>
                </Stack>
            );
        }
        return (
            <Stack spacing="4" direction={responsiveStyles} flex="1" justifyContent="center" alignSelf="center">
                <Button
                    as={Text}
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                    rightIcon={<IoCloseOutline />}
                    isDisabled={walletMismatch || !address || transaction.isExecuted || transaction.executionDate}
                    onClick={(event) => {
                        event.preventDefault();
                    }}
                >
                    Reject
                </Button>
                <Button
                    as={Text}
                    variant="outline"
                    colorScheme="green300"
                    size="sm"
                    rightIcon={<IoCheckmarkOutline />}
                    isDisabled={
                        walletMismatch ||
                        !address ||
                        transaction.isExecuted ||
                        transaction.executionDate ||
                        transaction.confirmationsRequired === transaction.confirmations.length
                    }
                    onClick={(event) => {
                        event.preventDefault();
                        approve(transaction.network, transaction.safe, transaction.safeTxHash);
                    }}
                >
                    Approve
                </Button>
            </Stack>
        );
    };

    return (
        <Accordion allowMultiple backgroundColor={backgroundColor} borderRadius="5px" boxShadow="md">
            <AccordionItem border="none">
                <Stack direction="row" justify="space-between" gap="0">
                    <AccordionButton
                        width="initial"
                        padding="5px 0 5px 10px"
                        flexBasis={["65%", "65%", "65%", "65%", "65%", "60%"]}
                        flexGrow="1"
                    >
                        <Stack direction="row" spacing="4" fontSize="sm" width="100%" justifyContent="space-between">
                            <Flex direction="column" align="center" justify="space-around">
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
                                    <Text textAlign="left">{transaction.safe.slice(0, 7)}</Text>
                                </Flex>
                                <Flex direction={responsiveStyles} alignItems="baseline">
                                    {(transaction.nonce || transaction.nonce === 0) && (
                                        <>
                                            <Text fontWeight="bold" paddingRight="5px">
                                                Nonce:
                                            </Text>
                                            <Text textAlign="left">{JSON.stringify(transaction.nonce)}</Text>
                                        </>
                                    )}
                                </Flex>
                            </Stack>
                            <Stack
                                spacing="2"
                                flex="1.25"
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
                                                href={`${networks[transaction.network.toLowerCase()].scanUrl}/tx/${
                                                    transaction.txHash || transaction.transactionHash
                                                }`}
                                                color="green300.500"
                                                isExternal
                                                display="flex"
                                                alignItems="center"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    window.open(event.target.href, "_blank", "noopener,noreferrer");
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
            </AccordionItem>
        </Accordion>
    );
}

Transaction.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    transaction: PropTypes.any,
    address: PropTypes.string,
    walletMismatch: PropTypes.bool,
};

export default memo(Transaction);
