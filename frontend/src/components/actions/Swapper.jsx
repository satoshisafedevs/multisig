import React, { useState, memo, useEffect } from "react";
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
    Text,
    Spinner,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { ethers } from "ethers";
import { useUser } from "../../providers/User";
import { usdFormatter, formatNumber } from "../../utils";
import networks from "../../utils/networks.json";
import SelectTokenModal from "./SelectTokenModal";

function Swapper({
    lifi,
    safe,
    setSafe,
    setChain,
    token,
    setToken,
    amount,
    setAmount,
    destinationSafe,
    setRouteData,
    totalUSDFrom,
    setTotalUSDFrom,
    setFromNetwork,
    setFromBalances,
}) {
    const { currentTeam } = useUser();
    const [isTokenModalOpen, setTokenModalOpen] = useState(false);
    const [networkName, setNetworkName] = useState("");
    const [tokenBalance, setTokenBalance] = useState("");
    const [lifiChainTokens, setLifiChainTokens] = useState([]);
    const [loadingTokens, setLoadingTokens] = useState(false);
    const { colorMode } = useColorMode();
    const grayColor = useColorModeValue("blackAlpha.700", "whiteAlpha.700");

    // const chainTokens = useMemo(() => {
    //     // Ensure that squid and squid.tokens are defined
    //     const tokens = squid?.tokens;

    //     // If tokens are available and chain is found, filter the tokens
    //     if (tokens && chain) {
    //         const val = tokens.filter((t) => t.chainId === chain);
    //         if (val.length === 0) {
    //             setUnsupportedNetwork(true);
    //         }
    //         return val;
    //     }

    //     // If any of the conditions are not met, return an empty array
    //     return [];
    // }, [squid, chain]);

    const handleSafe = async (safeConfig) => {
        setLoadingTokens(true);
        const { safeAddress, network } = safeConfig;
        setSafe(safeAddress);
        setNetworkName(network);
        setFromNetwork(network);
        const targetChainId = networks[network.toLowerCase()]?.id;
        const lifiTokens = await lifi.getTokens({ chains: [targetChainId] });
        setLifiChainTokens(lifiTokens?.tokens[targetChainId]);
        setChain(targetChainId);
        setToken({});
        setRouteData();
        setTokenBalance();
        if (!destinationSafe) setAmount("");
        setLoadingTokens(false);
    };

    // console.log("lifiChainTokens", lifiChainTokens);

    // const latestTokenPrice = useMemo(
    //     () => chainTokens && chainTokens.find((chainToken) => chainToken.symbol === token.symbol),
    //     [squid, token],
    // );

    // console.log("token", token);

    const calculateUSDValue = (value, usdPrice) => (value * usdPrice).toFixed(2);

    const totalUSDValue = () => {
        if (amount && token?.usdPrice) {
            const data = calculateUSDValue(amount, token.usdPrice);
            if (totalUSDFrom) {
                const diff = ((data - totalUSDFrom) / totalUSDFrom) * 100;
                return `${usdFormatter.format(data)} (${diff.toFixed(2)}%)`;
            }
            return usdFormatter.format(data);
        }
        return "$0.0";
    };

    useEffect(() => {
        if (amount && token?.usdPrice && !totalUSDFrom) {
            const initialUSDValue = calculateUSDValue(amount, token.usdPrice);
            setTotalUSDFrom(initialUSDValue);
        }
    }, [amount, token?.usdPrice, totalUSDFrom]);

    const getBalances = async () => {
        const rpcUrl = networks[networkName].url;
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
        ];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const ethBalance = await provider.getBalance(safe);
        const convertedEthBalance = ethers.utils.formatEther(ethBalance);
        if (token.address !== "0x0000000000000000000000000000000000000000") {
            const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
            const balance = await tokenContract.balanceOf(safe);
            const decimals = await tokenContract.decimals();
            const convertedBalance = ethers.utils.formatUnits(balance, decimals);
            setTokenBalance(convertedBalance);
            if (!destinationSafe) setFromBalances({ ETH: convertedEthBalance, [token.symbol]: convertedBalance });
            return;
        }
        setTokenBalance(convertedEthBalance);
        if (!destinationSafe) setFromBalances({ ETH: convertedEthBalance });
    };

    useEffect(() => {
        if (safe && token.address) {
            setTokenBalance();
            if (!destinationSafe) setFromBalances();
            getBalances();
        }
    }, [safe, token.address]);

    const displayTokenBalance = () => {
        if (token.symbol) {
            if (tokenBalance) {
                return (
                    <div>
                        Balance:{" "}
                        {destinationSafe ? (
                            tokenBalance
                        ) : (
                            <Button
                                variant="link"
                                fontWeight="normal"
                                fontSize="xs"
                                minWidth="unset"
                                color={grayColor}
                                onClick={() => {
                                    setAmount(tokenBalance);
                                    setRouteData();
                                }}
                            >
                                {tokenBalance}
                            </Button>
                        )}{" "}
                        {token.symbol}
                    </div>
                );
            }
            return "Balance: loading...";
        }
        return null;
    };

    const formatAmount = () => {
        if (destinationSafe) {
            if (amount === "") return "";
            return formatNumber(amount);
        }
        return amount;
    };

    return (
        <>
            <SelectTokenModal
                isOpen={isTokenModalOpen}
                setIsOpen={setTokenModalOpen}
                tokens={lifiChainTokens}
                setToken={setToken}
                safe={safe}
                network={networkName}
                setRouteData={setRouteData}
            />
            <Box display="flex" flexDirection="row">
                <Menu>
                    {({ isOpen }) => (
                        <>
                            <MenuButton
                                as={Button}
                                backgroundColor={colorMode === "light" && "var(--chakra-colors-whiteAlpha-900)"}
                                borderRightRadius="0"
                                border="1px solid"
                                borderColor="var(--chakra-colors-chakra-border-color)"
                                flexShrink="0"
                                fontWeight="normal"
                                fontSize="15px"
                                minWidth="30%"
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
                                    (destinationSafe && "Safe") || "Select Safe"
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
                <Button
                    backgroundColor={colorMode === "light" && "var(--chakra-colors-whiteAlpha-900)"}
                    borderRadius="0"
                    border="1px solid"
                    borderColor="var(--chakra-colors-chakra-border-color)"
                    borderLeft="0"
                    borderRight="0"
                    flexShrink="0"
                    minWidth="25%"
                    fontWeight="normal"
                    fontSize="15px"
                    onClick={() => setTokenModalOpen(true)}
                    isDisabled={loadingTokens || !lifi}
                >
                    {isTokenModalOpen || loadingTokens ? (
                        <Spinner speed="1s" />
                    ) : (
                        (!isEmpty(token) && (
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Image
                                    display="flex"
                                    alignItems="center"
                                    boxSize="1.5rem"
                                    borderRadius="full"
                                    src={token.logoURI}
                                    alt={token.symbol.substring(0, 3)}
                                    mr="12px"
                                />
                                {token.symbol}
                            </Box>
                        )) ||
                        (safe && "Select token") ||
                        (destinationSafe && "To Token") ||
                        "From Token"
                    )}
                </Button>
                <Input
                    placeholder="0.0"
                    borderLeftRadius="0"
                    minWidth="35%"
                    value={formatAmount()}
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
                        setAmount(validValue);
                        setRouteData();
                    }}
                    isDisabled={destinationSafe || !lifi}
                    _disabled={{
                        opacity: "unset",
                        cursor: "not-allowed",
                    }}
                />
            </Box>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box fontSize="xs" alignSelf="start" height="18px" color={grayColor}>
                    {displayTokenBalance()}
                </Box>
                <Text fontSize="xs" alignSelf="end" height="18px" color={grayColor}>
                    {amount && totalUSDValue()}
                </Text>
            </Box>
        </>
    );
}

Swapper.propTypes = {
    lifi: PropTypes.shape({
        getTokens: PropTypes.func,
    }),
    safe: PropTypes.string,
    setSafe: PropTypes.func,
    setChain: PropTypes.func,
    token: PropTypes.shape({
        symbol: PropTypes.string,
        logoURI: PropTypes.string,
        usdPrice: PropTypes.number,
        address: PropTypes.string,
    }).isRequired,
    setToken: PropTypes.func,
    amount: PropTypes.string,
    setAmount: PropTypes.func,
    destinationSafe: PropTypes.bool,
    totalUSDFrom: PropTypes.string,
    setTotalUSDFrom: PropTypes.func,
    setRouteData: PropTypes.func,
    setFromNetwork: PropTypes.func,
    setFromBalances: PropTypes.func,
};

export default memo(Swapper);
