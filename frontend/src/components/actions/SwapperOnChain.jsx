import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Menu,
    Button,
    MenuButton,
    MenuList,
    MenuItem,
    Image,
    Input,
    Spinner,
    useColorMode,
    Avatar,
    // useColorModeValue,
} from "@chakra-ui/react";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { ethers } from "ethers";
import { isEmpty } from "lodash";
import { useUser } from "../../providers/User";
import { usdFormatter, formatNumber } from "../../utils";
import networks from "../../utils/networks.json";
import SelectTokenModal from "./SelectTokenModal";

function SwapperOnChain({
    lifi,
    safe,
    fromToken,
    toToken,
    networkName,
    handleSafe,
    loadingTokens,
    lifiChainTokens,
    setFromToken,
    setToToken,
    setRouteData,
    fromAmount,
    setFromAmount,
    toAmount,
    setFromBalances,
}) {
    const [isFromTokenModalOpen, setFromTokenModalOpen] = useState(false);
    const [isToTokenModalOpen, setToTokenModalOpen] = useState(false);
    const [fromTokenBalance, setFromTokenBalance] = useState("");
    const [toTokenBalance, setToTokenBalance] = useState("");
    // const grayColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");
    const { currentTeam } = useUser();
    const { colorMode } = useColorMode();

    const calculateUSDValue = (value, usdPrice) => (value * usdPrice).toFixed(2);

    const totalFromUSDValue = () => {
        if (fromAmount && fromToken?.usdPrice) {
            const data = calculateUSDValue(fromAmount, fromToken.usdPrice);
            return usdFormatter.format(data);
        }
        return "$0.0";
    };

    const getFromBalances = async () => {
        const rpcUrl = networks[networkName].url;
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
        ];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const ethBalance = await provider.getBalance(safe);
        const convertedEthBalance = ethers.utils.formatEther(ethBalance);
        if (fromToken.address !== "0x0000000000000000000000000000000000000000") {
            const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, provider);
            const balance = await tokenContract.balanceOf(safe);
            const decimals = await tokenContract.decimals();
            const convertedBalance = ethers.utils.formatUnits(balance, decimals);
            setFromTokenBalance(convertedBalance);
            setFromBalances({ ETH: convertedEthBalance, [fromToken.symbol]: convertedBalance });
            return;
        }
        setFromTokenBalance(convertedEthBalance);
        setFromBalances({ ETH: convertedEthBalance });
    };

    useEffect(() => {
        if (safe && fromToken.address) {
            setFromTokenBalance();
            getFromBalances();
        }
    }, [safe, fromToken.address]);

    const displayTokenFromBalance = () => {
        if (fromToken.symbol) {
            if (fromTokenBalance) {
                return (
                    <div>
                        Balance:{" "}
                        <Button
                            variant="link"
                            fontWeight="normal"
                            fontSize="xs"
                            minWidth="unset"
                            color="gray.500"
                            onClick={() => {
                                setFromAmount(fromTokenBalance);
                                setRouteData();
                            }}
                        >
                            {fromTokenBalance}
                        </Button>{" "}
                        {fromToken.symbol}
                    </div>
                );
            }
            return "Balance: loading...";
        }
        return null;
    };

    const totalToUSDValue = () => {
        if (toAmount && toToken?.usdPrice) {
            const data = calculateUSDValue(toAmount, toToken.usdPrice);
            const data2 = calculateUSDValue(fromAmount, fromToken.usdPrice);
            const diff = ((data - data2) / data2) * 100;
            return `${usdFormatter.format(data)} (${Number.isNaN(diff) ? 0 : diff.toFixed(2)}%)`;
        }
        return "$0.0";
    };

    const getToBalances = async () => {
        const rpcUrl = networks[networkName].url;
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
        ];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const ethBalance = await provider.getBalance(safe);
        const convertedEthBalance = ethers.utils.formatEther(ethBalance);
        if (toToken.address !== "0x0000000000000000000000000000000000000000") {
            const tokenContract = new ethers.Contract(toToken.address, erc20Abi, provider);
            const balance = await tokenContract.balanceOf(safe);
            const decimals = await tokenContract.decimals();
            const convertedBalance = ethers.utils.formatUnits(balance, decimals);
            setToTokenBalance(convertedBalance);
            return;
        }
        setToTokenBalance(convertedEthBalance);
    };

    useEffect(() => {
        if (safe && toToken.address) {
            setToTokenBalance();
            getToBalances();
        }
    }, [safe, toToken.address]);

    const displayTokenToBalance = () => {
        if (toToken.symbol) {
            if (toTokenBalance) {
                return (
                    <div>
                        Balance: {toTokenBalance} {toToken.symbol}
                    </div>
                );
            }
            return "Balance: loading...";
        }
        return null;
    };

    const formatToAmount = () => {
        if (toAmount === "") return "";
        return formatNumber(toAmount);
    };

    return (
        <>
            <SelectTokenModal
                isOpen={isFromTokenModalOpen}
                setIsOpen={setFromTokenModalOpen}
                tokens={lifiChainTokens}
                setToken={setFromToken}
                safe={safe}
                network={networkName}
                setRouteData={setRouteData}
            />
            <SelectTokenModal
                isOpen={isToTokenModalOpen}
                setIsOpen={setToTokenModalOpen}
                tokens={lifiChainTokens}
                setToken={setToToken}
                safe={safe}
                network={networkName}
                setRouteData={setRouteData}
            />
            <Box display="flex" flexDirection="row">
                <Box width="30%" />
                <Box display="flex" flexDirection="row" justifyContent="space-between" minWidth="70%">
                    <Box fontSize="xs" alignSelf="start" height="18px" color="gray.500" marginLeft="5px">
                        {displayTokenFromBalance()}
                    </Box>
                    <Box fontSize="xs" alignSelf="end" height="18px" color="gray.500">
                        {fromToken?.address && fromAmount && totalFromUSDValue()}
                    </Box>
                </Box>
            </Box>
            <Box display="flex" flexDirection="row">
                <Menu>
                    {({ isOpen }) => (
                        <>
                            <MenuButton
                                as={Button}
                                backgroundColor={colorMode === "light" && "var(--chakra-colors-whiteAlpha-900)"}
                                border="1px solid"
                                borderColor="var(--chakra-colors-chakra-border-color)"
                                flexShrink="0"
                                fontWeight="normal"
                                fontSize="15px"
                                width="155px"
                                minWidth="30%"
                                height="85px"
                                isDisabled={!lifi}
                            >
                                {safe.length > 0 ? (
                                    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                                        <Image
                                            boxSize="1.5rem"
                                            borderRadius="full"
                                            src={networks[networkName].svg}
                                            alt={networks[networkName].title}
                                            mr="12px"
                                        />
                                        {safe.slice(0, 5)}...{safe.slice(-4)}
                                    </Box>
                                ) : (
                                    "Select Safe"
                                )}
                            </MenuButton>
                            <MenuList maxHeight="50vh" overflow="auto" display={isOpen ? "block" : "none"}>
                                {currentTeam.safes ? (
                                    currentTeam.safes.map((s) => (
                                        <MenuItem key={s.safeAddress} onClick={() => handleSafe(s)}>
                                            <Image
                                                boxSize="1.5rem"
                                                borderRadius="full"
                                                src={networks[s.network].svg}
                                                alt={networks[s.network].title}
                                                mr="12px"
                                            />
                                            {s.safeAddress.slice(0, 5)}
                                            ...
                                            {s.safeAddress.slice(-4)}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem>No safes</MenuItem>
                                )}
                            </MenuList>
                        </>
                    )}
                </Menu>
                <Box display="flex" flexDirection="column" minWidth="30%">
                    <Button
                        backgroundColor={colorMode === "light" && "var(--chakra-colors-whiteAlpha-900)"}
                        border="1px solid"
                        borderColor="var(--chakra-colors-chakra-border-color)"
                        marginLeft="5px"
                        marginBottom="5px"
                        marginRight="5px"
                        flexShrink="0"
                        minWidth="25%"
                        fontWeight="normal"
                        fontSize="15px"
                        onClick={() => setFromTokenModalOpen(true)}
                        isDisabled={loadingTokens || !lifi}
                    >
                        {isFromTokenModalOpen || loadingTokens ? (
                            <Spinner speed="1s" />
                        ) : (
                            (!isEmpty(fromToken) && (
                                <Box display="flex" flexDirection="row" alignItems="center">
                                    <Avatar
                                        display="flex"
                                        alignItems="center"
                                        boxSize="1.5rem"
                                        borderRadius="full"
                                        src={fromToken.logoURI}
                                        name={fromToken.symbol.substring(0, 3)}
                                        mr="12px"
                                    />
                                    {fromToken.symbol}
                                </Box>
                            )) ||
                            "From Token"
                        )}
                    </Button>
                    <Button
                        backgroundColor={colorMode === "light" && "var(--chakra-colors-whiteAlpha-900)"}
                        border="1px solid"
                        borderColor="var(--chakra-colors-chakra-border-color)"
                        marginRight="5px"
                        marginLeft="5px"
                        flexShrink="0"
                        minWidth="25%"
                        fontWeight="normal"
                        fontSize="15px"
                        onClick={() => setToTokenModalOpen(true)}
                        isDisabled={loadingTokens || !lifi}
                    >
                        {isToTokenModalOpen || loadingTokens ? (
                            <Spinner speed="1s" />
                        ) : (
                            (!isEmpty(toToken) && (
                                <Box display="flex" flexDirection="row" alignItems="center">
                                    <Avatar
                                        display="flex"
                                        alignItems="center"
                                        boxSize="1.5rem"
                                        borderRadius="full"
                                        src={toToken.logoURI}
                                        name={toToken.symbol.substring(0, 3)}
                                        mr="12px"
                                    />
                                    {toToken.symbol}
                                </Box>
                            )) ||
                            "To Token"
                        )}
                    </Button>
                </Box>
                <Box display="flex" flexDirection="column" width="40%">
                    <Input
                        width="auto"
                        placeholder="0.0"
                        marginBottom="5px"
                        value={fromAmount}
                        onChange={(e) => {
                            const { value } = e.target;
                            // Remove any characters that aren't digits or a period
                            let validValue = value.replace(/[^0-9.]/g, "");
                            // Remove leading zeros, but keep the number as a valid decimal
                            validValue = validValue.replace(/^0+(\d)/, "$1");
                            // If the string starts with a period, prepend a '0'
                            if (validValue.startsWith(".")) {
                                validValue = `0${validValue}`;
                            }
                            setFromAmount(validValue);
                            setRouteData();
                        }}
                        isDisabled={!lifi}
                        _disabled={{
                            opacity: "unset",
                            cursor: "not-allowed",
                        }}
                    />
                    <Box position="relative">
                        <IoArrowDownCircleOutline
                            style={{
                                position: "absolute",
                                top: "-16px",
                                left: "-16px",
                                minWidth: "27px",
                                minHeight: "27px",
                                color: "var(--chakra-colors-bronzeSwatch-400)",
                                zIndex: "1",
                            }}
                        />
                        <Input
                            placeholder="0.0"
                            minWidth="40%"
                            value={formatToAmount()}
                            isDisabled
                            _disabled={{
                                opacity: "unset",
                                cursor: "not-allowed",
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            <Box display="flex" flexDirection="row">
                <Box minWidth="30%" />
                <Box display="flex" flexDirection="row" justifyContent="space-between" minWidth="70%">
                    <Box fontSize="xs" alignSelf="start" height="18px" color="gray.500" marginLeft="5px">
                        {displayTokenToBalance()}
                    </Box>
                    <Box fontSize="xs" alignSelf="end" height="18px" color="gray.500">
                        {toAmount && totalToUSDValue()}
                    </Box>
                </Box>
            </Box>
        </>
    );
}

SwapperOnChain.propTypes = {
    lifi: PropTypes.shape({
        getTokens: PropTypes.func,
    }),
    safe: PropTypes.string,
    fromToken: PropTypes.shape({
        symbol: PropTypes.string,
        logoURI: PropTypes.string,
        usdPrice: PropTypes.number,
        address: PropTypes.string,
    }).isRequired,
    toToken: PropTypes.shape({
        symbol: PropTypes.string,
        logoURI: PropTypes.string,
        usdPrice: PropTypes.number,
        address: PropTypes.string,
    }).isRequired,
    setFromToken: PropTypes.func,
    setToToken: PropTypes.func,
    fromAmount: PropTypes.string,
    setFromAmount: PropTypes.func,
    toAmount: PropTypes.string,
    setRouteData: PropTypes.func,
    setFromBalances: PropTypes.func,
    networkName: PropTypes.string,
    handleSafe: PropTypes.func,
    loadingTokens: PropTypes.bool,
    lifiChainTokens: PropTypes.arrayOf(PropTypes.shape({})),
};

export default SwapperOnChain;
