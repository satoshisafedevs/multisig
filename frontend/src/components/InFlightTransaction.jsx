import React, { memo } from "react";
import PropTypes from "prop-types";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Code,
    Image,
    Link,
    Flex,
    Text,
    Stack,
    useColorModeValue,
    useStyleConfig,
    keyframes,
} from "@chakra-ui/react";
import { IoOpenOutline } from "react-icons/io5";
import networks from "../utils/networks.json";
import TransactionDetails from "./TransactionDetails";
import CopyToClipboard from "./CopyToClipboard";

function InFlightTransaction({ transaction }) {
    const baseColor = useColorModeValue("#EDF2F7", "rgba(255, 255, 255, 0.08)");
    const brightColor = useColorModeValue("#CBD5E0", "rgba(255, 255, 255, 0.16)");
    const codeBackground = useColorModeValue("gray.100", "#3D4756");
    const responsiveStyles = ["column", "column", "column", "column", "column", "row"];
    const accordionStyles = useStyleConfig("Accordion");

    const backgroundImage = `linear-gradient(
        to left,
        ${baseColor} 0%,
        ${baseColor} 40%,
        ${brightColor} 50%,
        ${baseColor} 60%,
        ${baseColor} 100%
    )`;

    const slide = keyframes`
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
    `;

    const animation = `${slide} 2s linear infinite`;

    return (
        <Accordion
            allowMultiple
            borderRadius="5px"
            animation={animation}
            bgImage={backgroundImage}
            backgroundSize="200% 100%"
        >
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
                                    direction="row"
                                    spacing="4"
                                    fontSize="sm"
                                    width="100%"
                                    justifyContent="space-between"
                                >
                                    <Flex direction="column" align="center" justify="space-evenly">
                                        <Image boxSize="24px" src={networks[transaction.network.toLowerCase()].svg} />
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
                                                {transaction.safe === "pending" ? (
                                                    <Text color="gray.500">Pending...</Text>
                                                ) : (
                                                    <>
                                                        <Text textAlign="left">
                                                            {transaction.safe.slice(0, 5)}...
                                                            {transaction.safe.slice(-4)}
                                                        </Text>
                                                        <CopyToClipboard
                                                            copy={transaction.safe}
                                                            tooltipSuffix="address"
                                                            size="21px"
                                                        />
                                                    </>
                                                )}
                                            </Box>
                                        </Flex>
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
                                                        color="blueSwatch.500"
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
                                                        Creating... <IoOpenOutline style={{ paddingLeft: "3px" }} />
                                                    </Link>
                                                ) : (
                                                    "Creating..."
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
                                                {transaction?.satoshiData?.type || "Unspecified"}
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </Stack>
                                <AccordionIcon margin="10px" />
                            </AccordionButton>
                        </Stack>
                        <AccordionPanel padding="0px" borderRadius="0 0 5px 5px">
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

InFlightTransaction.propTypes = {
    transaction: PropTypes.shape({
        network: PropTypes.string.isRequired,
        safe: PropTypes.string.isRequired,
        txHash: PropTypes.string,
        transactionHash: PropTypes.string,
        satoshiData: PropTypes.shape({
            type: PropTypes.string,
        }),
    }),
};

export default memo(InFlightTransaction);
