import React, { useState, useMemo, memo } from "react";
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
} from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { useUser } from "../../providers/User";
import networks from "../admin/networks.json";
import SelectTokenModal from "./SelectTokenModal";

function Swapper({ squid, safe, setSafe, chain, setChain, token, setToken, amount, setAmount, inputDisabled }) {
    const { currentTeam } = useUser();
    const [isTokenModalOpen, setTokenModalOpen] = useState(false);
    const [networkName, setNetworkName] = useState("");
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
        const targetChainId = squid?.chains.find((c) => {
            if (network === "mainnet") {
                // need special handling here as
                // https://v2.api.squidrouter.com/v2/sdk-info returns mainnet as ethereum
                // while we established baseline as mainnent across the app accodring to gnosis safe data
                return c.networkName.toLowerCase() === "ethereum";
            }
            return c.networkName.toLowerCase() === network.toLowerCase();
        })?.chainId;
        setChain(targetChainId);
        setToken({});
    };

    return (
        <>
            <SelectTokenModal
                isOpen={isTokenModalOpen}
                setIsOpen={setTokenModalOpen}
                tokens={chainTokens}
                setToken={setToken}
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
                                    "Safe"
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
                        "Token"
                    )}
                </Button>
                <Input
                    placeholder="0.0"
                    borderLeftRadius="0"
                    minWidth="35%"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    isDisabled={inputDisabled}
                    _disabled={{
                        opacity: "unset",
                        cursor: "not-allowed",
                    }}
                />
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
    }).isRequired,
    setToken: PropTypes.func,
    amount: PropTypes.string,
    setAmount: PropTypes.func,
    inputDisabled: PropTypes.bool,
};

export default memo(Swapper);
