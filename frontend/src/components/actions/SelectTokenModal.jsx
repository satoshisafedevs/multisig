import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Spinner,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { IoSearchOutline } from "react-icons/io5";
import { formatNumber, toHumanReadable } from "../../utils";
import networks from "../../utils/networks.json";
import { getWalletTokenBalances } from "../../firebase";

function SelectTokenModal({ tokens, isOpen, setIsOpen, setToken, safe, setRouteData, network, unsupportedNetwork }) {
    const [searchString, setSearchString] = useState("");
    const descriptionColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");
    const searchTokenRef = useRef();
    const [availableTokens, setAvailableTokens] = useState("");
    const [tokenError, setTokenError] = useState(false);
    const toast = useToast();

    const getTokenBalance = async () => {
        if (safe && network) {
            try {
                const targetChainID = networks[network].id;
                const response = await getWalletTokenBalances({ chainId: targetChainID, safeAddress: safe });
                const sanitizedData = response.data.data.items.filter(
                    (el) => el.type === "cryptocurrency" && el.quote_rate,
                );
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
                searchTokenRef.current?.focus();
            }, 0);
            getTokenBalance();
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setSearchString("");
        setRouteData();
        setAvailableTokens();
    };

    const handleTokenSearch = (e) => {
        setSearchString(e.target.value);
    };

    const searchTokens = useMemo(() => {
        if (tokens && searchString) {
            return tokens.filter(
                (token) =>
                    token.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
                    token.name.toLowerCase().includes(searchString.toLowerCase()),
            );
        }
        return tokens;
    }, [tokens, searchString]);

    const sortTokensByAvailability = (a, b) => {
        // Check if token A is in availableTokens
        const isATokenAvailable = availableTokens?.some(
            (el) => el.contract_address.toLowerCase() === a.address.toLowerCase(),
        );
        // Check if token B is in availableTokens
        const isBTokenAvailable = availableTokens?.some(
            (el) => el.contract_address.toLowerCase() === b.address.toLowerCase(),
        );

        // Order tokens that are available before those that aren't
        if (isATokenAvailable && !isBTokenAvailable) {
            return -1; // A comes before B
        }
        if (!isATokenAvailable && isBTokenAvailable) {
            return 1; // B comes before A
        }
        return 0; // No change in order
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
                    {tokens.length === 0 && !unsupportedNetwork && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            Ensure a safe is chosen before selecting a token
                        </Alert>
                    )}
                    {unsupportedNetwork && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            Network is not supported.
                        </Alert>
                    )}
                    {tokens.length > 0 && searchTokens.length === 0 ? (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            No results found
                        </Alert>
                    ) : (
                        <Box maxHeight="50vh" overflow="auto" margin="0 -5px">
                            {searchTokens.map((token) => (
                                <Box display="flex" flexDirection="row" key={token.name + token.symbol}>
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
                                            <Image
                                                boxSize="2rem"
                                                borderRadius="full"
                                                src={token.logoURI}
                                                alt={token.symbol}
                                                mr="12px"
                                                loading="lazy"
                                            />
                                        }
                                        onClick={() => {
                                            setToken({
                                                symbol: token.symbol,
                                                logoURI: token.logoURI,
                                                address: token.address,
                                                decimals: token.decimals,
                                                usdPrice: token.usdPrice,
                                            });
                                            onClose();
                                        }}
                                    >
                                        <Box display="flex" flexDirection="column" alignItems="start">
                                            {token.symbol}
                                            <br />
                                            <Box fontSize="smaller" color={descriptionColor}>
                                                {token.name}
                                            </Box>
                                        </Box>
                                        {!tokenError && (
                                            <Box display="flex" flex="1" justifyContent="flex-end">
                                                {availableTokens ? (
                                                    availableTokens
                                                        .filter(
                                                            (el) =>
                                                                el.contract_address.toLowerCase() ===
                                                                token.address.toLowerCase(),
                                                        )
                                                        .map((filteredToken) => (
                                                            <Box
                                                                key={filteredToken.contract_address}
                                                                display="flex"
                                                                flexDirection="column"
                                                                alignItems="end"
                                                            >
                                                                {formatNumber(
                                                                    toHumanReadable(
                                                                        filteredToken.balance,
                                                                        filteredToken.contract_decimals,
                                                                    ),
                                                                )}
                                                                <Box fontSize="smaller" color={descriptionColor}>
                                                                    {filteredToken.pretty_quote}
                                                                </Box>
                                                            </Box>
                                                        ))
                                                ) : (
                                                    <Spinner speed="1s" color={descriptionColor} />
                                                )}
                                            </Box>
                                        )}
                                    </Button>
                                </Box>
                            ))}
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
    unsupportedNetwork: PropTypes.bool,
};
export default SelectTokenModal;
