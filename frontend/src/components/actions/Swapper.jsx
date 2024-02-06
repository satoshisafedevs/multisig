import React, { useState, useMemo, memo, useEffect } from "react";
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
} from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { ethers } from "ethers";
import { useUser } from "../../providers/User";
import { usdFormatter } from "../../utils";
import networks from "../../utils/networks.json";
import SelectTokenModal from "./SelectTokenModal";

function Swapper({
    squid,
    safe,
    setSafe,
    chain,
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
    const { colorMode } = useColorMode();

    const chainTokens = useMemo(() => {
        // Ensure that squid and squid.tokens are defined
        const tokens = squid?.tokens;

        // If tokens are available and chain is found, filter the tokens
        if (tokens && chain) {
            return tokens.filter((t) => t.chainId === chain);
        }

        // If any of the conditions are not met, return an empty array
        return [];
    }, [squid, chain]);

    const handleSafe = (safeConfig) => {
        const { safeAddress, network } = safeConfig;
        setSafe(safeAddress);
        setNetworkName(network);
        setFromNetwork(network);
        const targetChainId = squid?.chains.find((c) => {
            if (network === "mainnet") {
                // need special handling here as
                // https://v2.api.squidrouter.com/v2/sdk-info returns mainnet as ethereum
                // while we established baseline as mainnet across the app accodring to gnosis safe data
                return c.networkName.toLowerCase() === "ethereum";
            }
            return c.networkName.toLowerCase() === network.toLowerCase();
        })?.chainId;
        setChain(targetChainId);
        setToken({});
        setRouteData();
        setTokenBalance();
    };

    const latestTokenPrice = useMemo(
        () => chainTokens.find((chainToken) => chainToken.symbol === token.symbol),
        [squid, token],
    );

    const calculateUSDValue = (value, usdPrice) => (value * usdPrice).toFixed(2);

    const totalUSDValue = () => {
        if (amount && latestTokenPrice?.usdPrice) {
            const data = calculateUSDValue(amount, latestTokenPrice.usdPrice);
            if (totalUSDFrom) {
                const diff = ((data - totalUSDFrom) / totalUSDFrom) * 100;
                return `${usdFormatter.format(data)} (${diff.toFixed(2)}%)`;
            }
            return usdFormatter.format(data);
        }
        return "$0.0";
    };

    useEffect(() => {
        if (amount && latestTokenPrice?.usdPrice && !totalUSDFrom) {
            const initialUSDValue = calculateUSDValue(amount, latestTokenPrice.usdPrice);
            setTotalUSDFrom(initialUSDValue);
        }
    }, [amount, latestTokenPrice?.usdPrice, totalUSDFrom]);

    // const getTokenBalance = async () => {
    //     const rpcUrl = networks[networkName].url;
    //     const erc20Abi = [
    //         "function balanceOf(address owner) view returns (uint256)",
    //         "function decimals() view returns (uint8)",
    //     ];
    //     const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    //     if (token.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    //         const balance = await provider.getBalance(safe);
    //         const convertedBalance = ethers.utils.formatEther(balance);
    //         setTokenBalance(convertedBalance);
    //         setFromBalance(convertedBalance);
    //         return;
    //     }
    //     const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
    //     const balance = await tokenContract.balanceOf(safe);
    //     const decimals = await tokenContract.decimals();
    //     const convertedBalance = ethers.utils.formatUnits(balance, decimals);
    //     setTokenBalance(convertedBalance);
    //     setFromBalance(convertedBalance);
    // };

    const getBalances = async () => {
        const rpcUrl = networks[networkName].url;
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
        ];
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const ethBalance = await provider.getBalance(safe);
        const convertedEthBalance = ethers.utils.formatEther(ethBalance);
        if (token.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
            const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
            const balance = await tokenContract.balanceOf(safe);
            const decimals = await tokenContract.decimals();
            const convertedBalance = ethers.utils.formatUnits(balance, decimals);
            setTokenBalance(convertedBalance);
            setFromBalances({ ETH: convertedEthBalance, [token.symbol]: convertedBalance });
            return;
        }
        setTokenBalance(convertedEthBalance);
        setFromBalances({ ETH: convertedEthBalance });
    };

    useEffect(() => {
        if (safe && token.address) {
            setTokenBalance();
            setFromBalances();
            getBalances();
        }
    }, [safe, token.address]);

    const displayTokenBalance = () => {
        if (token.symbol) {
            if (tokenBalance) {
                return `Balance: ${tokenBalance} ${token.symbol}`;
            }
            return "Balance: loading...";
        }
        return null;
    };

    return (
        <>
            <SelectTokenModal
                isOpen={isTokenModalOpen}
                setIsOpen={setTokenModalOpen}
                tokens={chainTokens}
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
                                isDisabled={!squid}
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
                                    (destinationSafe && "To Safe") || "From Safe"
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
                    isDisabled={!squid}
                >
                    {isTokenModalOpen ? (
                        <Spinner speed="1s" />
                    ) : (
                        (!isEmpty(token) && (
                            <Box display="flex" flexDirection="row" alignItems="center">
                                <Image
                                    boxSize="1.5rem"
                                    borderRadius="full"
                                    src={token.logoURI}
                                    alt={token.symbol}
                                    mr="12px"
                                />
                                {token.symbol}
                            </Box>
                        )) ||
                        (safe && "Select token") ||
                        "Token"
                    )}
                </Button>
                <Input
                    placeholder="0.0"
                    borderLeftRadius="0"
                    minWidth="35%"
                    value={amount}
                    onChange={(e) => {
                        const { value } = e.target;
                        const validValue = value.replace(/[^0-9.]/g, "");
                        setAmount(validValue);
                        setRouteData();
                    }}
                    isDisabled={destinationSafe || !squid}
                    _disabled={{
                        opacity: "unset",
                        cursor: "not-allowed",
                    }}
                />
            </Box>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Text fontSize="xs" alignSelf="start" height="18px">
                    {displayTokenBalance()}
                </Text>
                <Text fontSize="xs" alignSelf="end" height="18px">
                    {amount && totalUSDValue()}
                </Text>
            </Box>
        </>
    );
}

Swapper.propTypes = {
    squid: PropTypes.shape({
        chains: PropTypes.arrayOf(PropTypes.shape({})),
        tokens: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    safe: PropTypes.string,
    setSafe: PropTypes.func,
    chain: PropTypes.string,
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
