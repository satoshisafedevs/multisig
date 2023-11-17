import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { ethers } from "ethers";
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
    useColorModeValue,
} from "@chakra-ui/react";
import { IoSearchOutline } from "react-icons/io5";

function SelectTokenModal({ tokens, isOpen, setIsOpen, setToken, safe, setRouteData }) {
    const [searchString, setSearchString] = useState("");
    const descriptionColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");
    const searchTokenRef = useRef();

    // eslint-disable-next-line no-unused-vars
    const getBalances = async () => {
        const rpcUrl = "https://arb1.arbitrum.io/rpc";
        // this works only for arbitrum network

        const tokenAddresses = tokens.map((token) => token.address).slice(0, 25);
        // NOTE: only 25 here to reduce throttle by rpc!!!

        const erc20Abi = [
            {
                constant: true,
                inputs: [],
                name: "decimals",
                outputs: [
                    {
                        name: "",
                        type: "uint8",
                    },
                ],
                type: "function",
            },
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [
                    {
                        name: "balance",
                        type: "uint256",
                    },
                ],
                type: "function",
            },
        ];

        async function batchRequest() {
            const batchProvider = new ethers.providers.JsonRpcBatchProvider(rpcUrl);

            const tokenContracts = tokenAddresses.map((address) => {
                if (address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
                    return batchProvider.getBalance(safe);
                }
                // need to redo here to something like:
                // const balance = await tokenContract.balanceOf(safe);
                // const decimals = await tokenContract.decimals();
                // and in balance below:
                // ethers.utils.formatUnits(balance, decimals)
                return new ethers.Contract(address, erc20Abi, batchProvider).balanceOf(safe);
            });

            const balances = await Promise.all(tokenContracts);

            const balanceData = balances.map((balance, index) => ({
                tokenAddress: tokenAddresses[index],
                balance: ethers.utils.formatEther(balance),
            }));

            console.log(balanceData);
        }

        batchRequest();
    };

    // if (isOpen && tokens.length) {
    //     getBalances();
    // this is just not finished POC work...
    // }

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchTokenRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setSearchString("");
        setRouteData();
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
                            Ensure a safe is chosen before selecting a token
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
    setRouteData: PropTypes.func,
};
export default SelectTokenModal;
