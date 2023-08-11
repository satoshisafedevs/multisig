import React from "react";
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
import { IoCheckmarkOutline, IoCloseOutline, IoOpenOutline } from "react-icons/io5";
import networks from "./admin/networks.json";

function Transaction({ transaction, address, walletMismatch, approveTransaction }) {
    const backgroundHover = useColorModeValue("gray.100", "whiteAlpha.200");
    const responsiveStyles = ["column", "column", "column", "column", "column", "row"];

    // function weiToEth(wei) {
    //     const ETH_IN_WEI = 1e18;
    //     return wei / ETH_IN_WEI;
    // }

    return (
        <Accordion allowMultiple padding="5px 10px" backgroundColor={backgroundHover} borderRadius="5px" boxShadow="md">
            <AccordionItem border="none">
                <Stack direction="row" justify="space-between">
                    <AccordionButton
                        padding="0"
                        width="initial"
                        _hover={{ background: "none" }}
                        flexBasis={["65%", "65%", "65%", "65%", "65%", "60%"]}
                    >
                        <Stack direction="row" spacing="4" fontSize="sm" width="100%" justifyContent="space-between">
                            <Flex direction="column" align="center" justify="space-around">
                                <Image boxSize="24px" src={networks[transaction.network.toLowerCase()].icon} />
                                <Text fontSize="xs" fontWeight="bold">
                                    {transaction.network}
                                </Text>
                            </Flex>
                            <Stack spacing="2" alignSelf="center" flexGrow="1">
                                <Flex direction={responsiveStyles} alignItems="baseline">
                                    <Text fontWeight="bold" paddingRight="5px">
                                        Safe:
                                    </Text>
                                    <Text textAlign="left">{transaction.safe.slice(0, 7)}</Text>
                                </Flex>
                                <Flex direction={responsiveStyles} alignItems="baseline">
                                    <Text fontWeight="bold" paddingRight="5px">
                                        Nonce:
                                    </Text>
                                    <Text textAlign="left">{JSON.stringify(transaction.nonce) || "none"}</Text>
                                </Flex>
                            </Stack>
                            <Stack spacing="2" alignSelf="center" flexGrow="1">
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
                                    <Text textAlign="left">
                                        {transaction.dataDecoded?.method || (transaction.from && "Receive") || "?"}
                                    </Text>
                                </Flex>
                            </Stack>
                        </Stack>
                    </AccordionButton>
                    <Stack spacing="4" direction={responsiveStyles} alignSelf="center">
                        <Button
                            variant="outline"
                            colorScheme="red"
                            size="sm"
                            rightIcon={<IoCloseOutline />}
                            isDisabled={
                                walletMismatch || !address || transaction.isExecuted || transaction.executionDate
                            }
                        >
                            Reject
                        </Button>
                        <Button
                            variant="outline"
                            colorScheme="green300"
                            size="sm"
                            rightIcon={<IoCheckmarkOutline />}
                            isDisabled={
                                walletMismatch || !address || transaction.isExecuted || transaction.executionDate
                            }
                            onClick={() =>
                                approveTransaction(transaction.network, transaction.safe, transaction.safeTxHash)
                            }
                        >
                            Approve
                        </Button>
                    </Stack>
                    <AccordionButton padding="0" width="initial" _hover={{ background: "none" }}>
                        <AccordionIcon />
                    </AccordionButton>
                </Stack>
                <AccordionPanel padding="15px 0px">
                    <Code width="100%">
                        <pre style={{ overflow: "auto" }}>{JSON.stringify(transaction, null, 2)}</pre>
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
    approveTransaction: PropTypes.func,
};

export default Transaction;
