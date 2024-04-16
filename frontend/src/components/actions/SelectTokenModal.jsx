import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Alert,
    AlertIcon,
    Avatar,
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    InputGroup,
    InputLeftElement,
    Tooltip,
    Skeleton,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import { IoSearchOutline } from "react-icons/io5";
import { formatNumber, toHumanReadable } from "../../utils";
import networks from "../../utils/networks.json";
import { getWalletTokenBalances } from "../../firebase";

function SelectTokenModal({ tokens, isOpen, setIsOpen, setToken, safe, setRouteData, network }) {
    const [searchString, setSearchString] = useState("");
    const descriptionColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");
    const searchTokenRef = useRef();
    const [availableTokens, setAvailableTokens] = useState("");
    const [tokenError, setTokenError] = useState(false);
    const [listHeight, setListHeight] = useState(400);
    const toast = useToast();

    useEffect(() => {
        const updateSize = () => {
            // Example: Set the list height to be 50% of the viewport height
            setListHeight(window.innerHeight * 0.5);
        };

        window.addEventListener("resize", updateSize);
        updateSize(); // Initialize size on mount

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const getTokenBalance = async () => {
        if (safe && network) {
            try {
                const targetChainID = networks[network]?.id;
                const response = await getWalletTokenBalances({ chainId: targetChainID, safeAddress: safe });
                let sanitizedData = response?.data?.data?.items?.filter(
                    (el) => el?.type === "cryptocurrency" && el?.quote_rate,
                );
                sanitizedData = sanitizedData.map((token) => {
                    if (token?.contract_address?.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
                        return { ...token, contract_address: "0x0000000000000000000000000000000000000000" };
                    }
                    return token;
                });
                setAvailableTokens(sanitizedData);
            } catch (error) {
                setTokenError(true);
                toast({
                    description: `Failed to get tokens list: ${error.message}`,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchTokenRef?.current?.focus();
            }, 0);
            getTokenBalance();
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setSearchString("");
    };

    const handleTokenSearch = (e) => {
        setSearchString(e.target.value);
    };

    const searchTokens = useMemo(() => {
        if (tokens && searchString) {
            return tokens.filter(
                (token) =>
                    token.symbol?.toLowerCase().includes(searchString.toLowerCase()) ||
                    token.name?.toLowerCase().includes(searchString.toLowerCase()) ||
                    token.address?.toLowerCase().includes(searchString.toLowerCase()),
            );
        }
        return tokens;
    }, [tokens, searchString]);

    // eslint-disable-next-line react/no-unstable-nested-components
    function TokenRow({ index, style }) {
        const token = searchTokens[index];
        return (
            <Box display="flex" flexDirection="row" style={style} key={token?.address}>
                <Button
                    height="50px"
                    fontWeight="normal"
                    flexGrow="1"
                    justifyContent="start"
                    paddingLeft="5px"
                    paddingRight="10px"
                    margin="5px"
                    variant="ghost"
                    leftIcon={
                        // eslint-disable-next-line react/jsx-wrap-multilines
                        <Avatar
                            display="flex"
                            alignItems="center"
                            boxSize="2rem"
                            borderRadius="full"
                            src={token?.logoURI}
                            name={token?.symbol}
                            mr="12px"
                            loading="lazy"
                        />
                    }
                    onClick={() => {
                        setToken({
                            symbol: token?.symbol,
                            logoURI: token?.logoURI,
                            address: token?.address,
                            decimals: token?.decimals,
                            usdPrice: Number(token?.priceUSD),
                        });
                        onClose();
                        setRouteData();
                        setAvailableTokens();
                    }}
                >
                    <Tooltip label={token?.address} placement="top-start" fontWeight="normal">
                        <Box display="flex" flexDirection="column" alignItems="start">
                            {token?.symbol}
                            <br />
                            <Box
                                fontSize="smaller"
                                color={descriptionColor}
                                textAlign="initial"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                                maxWidth="350px"
                            >
                                {token?.name}
                            </Box>
                        </Box>
                    </Tooltip>
                    {!tokenError && (
                        <Box display="flex" flex="1" justifyContent="flex-end">
                            {availableTokens ? (
                                availableTokens
                                    .filter(
                                        (el) => el.contract_address?.toLowerCase() === token?.address?.toLowerCase(),
                                    )
                                    .map((filteredToken) => (
                                        <Box
                                            key={filteredToken?.contract_address}
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="end"
                                        >
                                            {formatNumber(
                                                toHumanReadable(
                                                    filteredToken?.balance,
                                                    filteredToken?.contract_decimals,
                                                ),
                                            )}
                                            <Box fontSize="smaller" color={descriptionColor}>
                                                {filteredToken?.pretty_quote}
                                            </Box>
                                        </Box>
                                    ))
                            ) : (
                                <Skeleton height="25px" width="80px" speed={0.9} />
                            )}
                        </Box>
                    )}
                </Button>
            </Box>
        );
    }

    TokenRow.propTypes = {
        index: PropTypes.number.isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        style: PropTypes.object.isRequired,
    };

    const sortTokensByAvailability = (a, b) => {
        // Check if token A is in availableTokens and get its quote
        const aToken = availableTokens?.find((el) => el.contract_address?.toLowerCase() === a.address?.toLowerCase());
        const isATokenAvailable = !!aToken;
        const aQuote = aToken?.quote || 0;

        // Check if token B is in availableTokens and get its quote
        const bToken = availableTokens?.find((el) => el.contract_address?.toLowerCase() === b.address?.toLowerCase());
        const isBTokenAvailable = !!bToken;
        const bQuote = bToken?.quote || 0;

        // Order tokens that are available before those that aren't
        if (isATokenAvailable && !isBTokenAvailable) {
            return -1; // A comes before B
        }
        if (!isATokenAvailable && isBTokenAvailable) {
            return 1; // B comes before A
        }
        // If both are available or both unavailable, sort by the highest quote
        return bQuote - aQuote; // Descending order, higher quote comes first
    };

    if (availableTokens) {
        searchTokens.sort(sortTokensByAvailability);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader>Select token</ModalHeader>
                <ModalBody paddingTop="0" paddingBottom="0">
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <IoSearchOutline color="gray.300" />
                        </InputLeftElement>
                        <Input
                            onChange={handleTokenSearch}
                            value={searchString}
                            placeholder="Search tokens..."
                            ref={searchTokenRef}
                        />
                    </InputGroup>
                    <Box fontSize="small" padding="5px 5px 0 5px" color={descriptionColor}>
                        {searchTokens.length} Tokens
                    </Box>
                    {tokens.length === 0 && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            Ensure a safe is chosen before selecting a token.
                        </Alert>
                    )}
                    {tokens.length > 0 && searchTokens.length === 0 && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            No results found
                        </Alert>
                    )}
                    {tokens.length > 0 && searchTokens.length > 0 && (
                        <Box maxHeight="50vh" overflow="auto" margin="0 -5px">
                            <List
                                height={listHeight} // Adjust based on your needs
                                width="100%"
                                itemCount={searchTokens.length}
                                itemSize={50} // Adjust based on your row height
                                itemData={searchTokens}
                            >
                                {TokenRow}
                            </List>
                        </Box>
                    )}
                </ModalBody>
                <ModalFooter padding="1.5rem 0 0 0" />
            </ModalContent>
        </Modal>
    );
}

SelectTokenModal.propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.shape({})),
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
    setToken: PropTypes.func,
    safe: PropTypes.string,
    network: PropTypes.string,
    setRouteData: PropTypes.func,
};
export default SelectTokenModal;
