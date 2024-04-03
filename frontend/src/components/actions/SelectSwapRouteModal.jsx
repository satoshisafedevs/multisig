import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Image,
    Table,
    Tbody,
    Thead,
    Th,
    Tr,
    Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    CircularProgress,
    useColorModeValue,
    Skeleton,
    Tooltip,
} from "@chakra-ui/react";
import { usdFormatter, toHumanReadable, formatNumber } from "../../utils";

function SelectSwapRouteModal({ routes, isOpen, setIsOpen, setRouteData, getLiFiRoutes, loadingRoutes }) {
    const [countdown, setCountdown] = useState(0);
    const rowColor = useColorModeValue("blueSwatch.100", "blueSwatch.600");
    const rowHoverColor = useColorModeValue("bronzeSwatch.300", "bronzeSwatch.500");

    const timerId = useRef(null);
    const quoteRefreshLength = 30;

    const onClose = () => {
        setIsOpen(false);
        setCountdown(0);
        if (timerId) {
            clearTimeout(timerId); // Clear the timer
        }
    };

    useEffect(() => {
        // Clear any existing timer first to avoid multiple timers running
        if (timerId.current) {
            clearTimeout(timerId.current);
        }

        // Start the timer only if the modal is open and other conditions are met
        if (isOpen && routes && countdown < quoteRefreshLength) {
            timerId.current = setTimeout(() => {
                setCountdown((prevCountdown) => prevCountdown + 1);
            }, 1000);
        } else if (isOpen && countdown >= quoteRefreshLength) {
            getLiFiRoutes(); // Fetch new routes
            setCountdown(0); // Reset countdown for the next cycle
        }

        // Cleanup function to clear the timer when the effect re-runs or on component unmount
        return () => {
            if (timerId.current) {
                clearTimeout(timerId.current);
            }
        };
    }, [isOpen, routes, countdown]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader display="flex" alignItems="center">
                    Chose swap estimate
                    <Tooltip label={`Estimate(s) will update in ${quoteRefreshLength - countdown} seconds`}>
                        <span>
                            <CircularProgress
                                paddingLeft="10px"
                                color="bronzeSwatch.500"
                                value={countdown * 3.33}
                                size="20px"
                            />
                        </span>
                    </Tooltip>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody maxHeight="calc(100vh - 62px - 72px - var(--chakra-space-16) * 2)" overflow="auto">
                    {routes?.length === 0 && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            No swap routes are currently available for the entered amount with the selected safe-token
                            pairs.
                        </Alert>
                    )}
                    {routes?.length > 0 && (
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>You get</Th>
                                    <Th>Gas fee</Th>
                                    <Th>Swap provider</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {routes?.map((el) => (
                                    <Tr
                                        key={el?.id}
                                        onClick={() => {
                                            if (!loadingRoutes) {
                                                setRouteData(el);
                                                onClose();
                                            }
                                        }}
                                        _odd={{ backgroundColor: rowColor }}
                                        _hover={{
                                            cursor: loadingRoutes ? "not-allowed" : "pointer",
                                            backgroundColor: rowHoverColor,
                                        }}
                                    >
                                        <Td>
                                            <Skeleton isLoaded={!loadingRoutes}>
                                                <Box display="flex" flexDirection="column">
                                                    <Box display="flex" flexDirection="row">
                                                        <Image
                                                            boxSize="1.4rem"
                                                            borderRadius="full"
                                                            src={el?.toToken?.logoURI}
                                                            alt={el?.toToken?.name}
                                                            mr="8px"
                                                        />{" "}
                                                        {Number(
                                                            toHumanReadable(el?.toAmount, el?.toToken?.decimals),
                                                        ).toFixed(4)}{" "}
                                                        {el?.toToken?.symbol}
                                                    </Box>
                                                    <Box paddingLeft="30px">{usdFormatter.format(el?.toAmountUSD)}</Box>
                                                </Box>
                                            </Skeleton>
                                        </Td>
                                        <Td>
                                            <Skeleton isLoaded={!loadingRoutes}>
                                                <Box display="flex" flexDirection="column">
                                                    <Box display="flex" flexDirection="row">
                                                        <Image
                                                            boxSize="1.4rem"
                                                            borderRadius="full"
                                                            src={el?.steps[0]?.estimate?.gasCosts[0]?.token?.logoURI}
                                                            alt={el?.steps[0]?.estimate?.gasCosts[0]?.token?.symbol}
                                                            mr="8px"
                                                        />{" "}
                                                        {formatNumber(
                                                            toHumanReadable(
                                                                el?.steps[0]?.estimate?.gasCosts[0]?.amount,
                                                                el?.steps[0]?.estimate?.gasCosts[0]?.token?.decimals,
                                                            ),
                                                        )}{" "}
                                                        {el?.steps[0]?.estimate?.gasCosts[0]?.token?.symbol}
                                                    </Box>
                                                    <Box paddingLeft="30px">{usdFormatter.format(el?.gasCostUSD)}</Box>
                                                </Box>
                                            </Skeleton>
                                        </Td>
                                        <Td>
                                            <Skeleton isLoaded={!loadingRoutes}>
                                                <Box display="flex" flexDirection="row">
                                                    <Image
                                                        boxSize="1.4rem"
                                                        borderRadius="full"
                                                        src={el?.steps[0]?.toolDetails?.logoURI}
                                                        alt={el?.steps[0]?.toolDetails?.name}
                                                        mr="8px"
                                                    />
                                                    {el?.steps[0]?.toolDetails?.name}
                                                </Box>
                                            </Skeleton>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button ariant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

SelectSwapRouteModal.propTypes = {
    routes: PropTypes.arrayOf(PropTypes.shape({})),
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
    setRouteData: PropTypes.func,
    getLiFiRoutes: PropTypes.func,
    loadingRoutes: PropTypes.bool,
};
export default SelectSwapRouteModal;
