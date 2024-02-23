import React, { useState } from "react";
import {
    Box,
    Input,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Image,
    Button,
    Stack,
    Spinner,
    Text,
    useColorMode,
    useStyleConfig,
    useToast,
    useColorModeValue,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { upperFirst } from "lodash";
import { IoCashOutline, IoRefreshOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import { useWagmi } from "../../providers/Wagmi";
import { formatNumber, fromHumanReadable, toHumanReadable } from "../../utils";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import networks from "../../utils/networks.json";

export default function Send() {
    const [safe, setSafe] = useState("");
    const [selectedToken, setSelectedToken] = useState("");
    const [availableTokens, setAvailableTokens] = useState("");
    const [loadingTokens, setLoadingTokens] = useState(false);
    const [networkName, setNetworkName] = useState("");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [sending, setSending] = useState(false);
    const { colorMode } = useColorMode();
    const { currentTeam, user } = useUser();
    const { address, chain, chains, metaMaskInstalled, switchNetwork, walletMismatch } = useWagmi();
    const { createAndApproveSendTransaction } = useGnosisSafe();
    const inputStyles = useStyleConfig("Input");
    const toast = useToast();
    const grayColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");

    const getTokenBalance = async (network, safeAddress) => {
        const targetChainID = networks[network].id;
        try {
            setLoadingTokens(true);
            const baseUrl = "https://api-getwallettokenbalances-mojsb2l5zq-uc.a.run.app";
            const response = await fetch(`${baseUrl}/?chainId=${targetChainID}&safeAddress=${safeAddress}`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }
            const data = await response.json();
            const sanitizedData = data.data.items.filter((el) => el.type === "cryptocurrency" && el.quote_rate);
            setAvailableTokens(sanitizedData);
        } catch (error) {
            toast({
                description: `Failed to get tokens list: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingTokens(false);
        }
    };

    const selectSafe = async (safeConfig) => {
        const { safeAddress, network } = safeConfig;
        setSafe(safeAddress);
        setNetworkName(network);
        await getTokenBalance(network, safeAddress);
    };

    const imageSrc = (tokenData) => {
        const baseUrl = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";
        if (tokenData.native_token) {
            return `${baseUrl}/ethereum/info/logo.png`;
        }
        return `${baseUrl}/${networkName === "mainnet" ? "ethereum" : networkName}/assets/${ethers.utils.getAddress(
            tokenData.contract_address,
        )}/logo.png`;
    };

    const networkMismatch =
        chain && (networkName === "mainnet" ? chain.network !== "homestead" : chain.network !== networkName);

    const invalidRecipient = recipient !== "" && !ethers.utils.isAddress(recipient);

    const exceedingAmount =
        selectedToken &&
        amount &&
        Number(selectedToken.balance) < Number(fromHumanReadable(amount, selectedToken.contract_decimals));

    const tokenABI = [
        {
            constant: false,
            inputs: [
                {
                    name: "_to",
                    type: "address",
                },
                {
                    name: "_value",
                    type: "uint256",
                },
            ],
            name: "transfer",
            outputs: [
                {
                    name: "",
                    type: "bool",
                },
            ],
            type: "function",
        },
    ];

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const erc20TokenAddress = selectedToken && ethers.utils.getAddress(selectedToken.contract_address);

    const tokenContract = new ethers.Contract(erc20TokenAddress, tokenABI, provider);

    const data =
        recipient &&
        ethers.utils.isAddress(recipient) &&
        selectedToken &&
        amount &&
        tokenContract.interface.encodeFunctionData("transfer", [
            ethers.utils.getAddress(recipient),
            fromHumanReadable(amount, selectedToken.contract_decimals),
        ]);

    const satoshiData = {
        type: "send",
        from: safe && ethers.utils.getAddress(safe),
        to: recipient && ethers.utils.isAddress(recipient) && ethers.utils.getAddress(recipient),
        token: selectedToken.native_token ? "ETH" : selectedToken.contract_ticker_symbol,
        amount,
    };

    return (
        <Stack padding="10px 0" gap="20px">
            <Box display="flex" flexDirection="row">
                <Box minWidth="35%">
                    <Text fontSize="xs" color="gray.500">
                        Sender
                    </Text>
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
                                    width="100%"
                                >
                                    {safe.length > 0 ? (
                                        <Box
                                            display="flex"
                                            flexDirection="row"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
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
                                        "From Safe"
                                    )}
                                </MenuButton>
                                <MenuList maxHeight="50vh" overflow="auto" display={isOpen ? "block" : "none"}>
                                    {currentTeam.safes ? (
                                        currentTeam.safes.map((s) => (
                                            <MenuItem
                                                key={s.safeAddress}
                                                onClick={() => {
                                                    selectSafe(s);
                                                    setSelectedToken("");
                                                    setAmount("");
                                                }}
                                            >
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
                </Box>
                <Box width="100%">
                    <Text fontSize="xs" color="gray.500">
                        Recipient
                    </Text>
                    <Input
                        borderLeftColor="transparent"
                        _hover={{ borderLeftColor: `${!invalidRecipient} && transparent` }}
                        // eslint-disable-next-line no-underscore-dangle
                        _focusVisible={{ ...inputStyles.field._focusVisible }}
                        borderLeftRadius="0"
                        marginLeft="-1px"
                        placeholder="Recipient address or ENS"
                        value={recipient}
                        onChange={(event) => setRecipient(event.target.value)}
                        isInvalid={invalidRecipient}
                        errorBorderColor="red.300"
                    />
                </Box>
            </Box>
            <Box display="flex" flexDirection="row">
                <Box minWidth="35%">
                    <Text
                        fontSize="xs"
                        minWidth="35%"
                        color="gray.500"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        overflow="hidden"
                    >
                        Balance{selectedToken && `: ${selectedToken.pretty_quote}`}
                    </Text>
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
                                    width="100%"
                                    isDisabled={loadingTokens}
                                >
                                    {(loadingTokens && <Spinner speed="1s" />) ||
                                        (selectedToken && (
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                whiteSpace="normal"
                                            >
                                                <Image
                                                    boxSize="1.5rem"
                                                    borderRadius="full"
                                                    src={imageSrc(selectedToken)}
                                                    alt=" "
                                                    mr="12px"
                                                    fallbackSrc={selectedToken.logo_urls.token_logo_url}
                                                    fallbackStrategy="onError"
                                                />{" "}
                                                {formatNumber(
                                                    toHumanReadable(
                                                        selectedToken.balance,
                                                        selectedToken.contract_decimals,
                                                    ),
                                                )}{" "}
                                                {selectedToken.contract_ticker_symbol}
                                            </Box>
                                        )) ||
                                        (safe && "Select token") ||
                                        "Token"}
                                </MenuButton>
                                <MenuList maxHeight="50vh" overflow="auto" display={isOpen ? "block" : "none"}>
                                    {availableTokens &&
                                        availableTokens.map((token) => (
                                            <MenuItem
                                                key={token.contract_address}
                                                onClick={() => setSelectedToken(token)}
                                            >
                                                <Image
                                                    boxSize="1.5rem"
                                                    borderRadius="full"
                                                    src={imageSrc(token)}
                                                    alt=" "
                                                    mr="12px"
                                                    fallbackSrc={token.logo_urls.token_logo_url}
                                                    fallbackStrategy="onError"
                                                />
                                                {formatNumber(toHumanReadable(token.balance, token.contract_decimals))}
                                                <Box color={grayColor} whiteSpace="nowrap">
                                                    &nbsp;
                                                    {token.contract_ticker_symbol}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    {availableTokens && (
                                        <MenuItem
                                            closeOnSelect={false}
                                            onClick={() => {
                                                getTokenBalance(networkName, safe);
                                                setSelectedToken("");
                                            }}
                                        >
                                            <IoRefreshOutline
                                                size="24px"
                                                style={{
                                                    marginRight: "12px",
                                                    color: "var(--chakra-colors-green300-500)",
                                                }}
                                            />
                                            Refresh token list
                                        </MenuItem>
                                    )}
                                    {!availableTokens && <MenuItem>Select safe first</MenuItem>}
                                </MenuList>
                            </>
                        )}
                    </Menu>
                </Box>
                <Box width="100%">
                    <Text fontSize="xs" color="gray.500">
                        Amount{amount && selectedToken && `: ${formatNumber(amount * selectedToken.quote_rate, true)}`}
                    </Text>
                    <InputGroup>
                        <Input
                            borderLeftColor="transparent"
                            _hover={{ borderLeftColor: `${!exceedingAmount} && transparent` }}
                            // eslint-disable-next-line no-underscore-dangle
                            _focusVisible={{ ...inputStyles.field._focusVisible }}
                            borderLeftRadius="0"
                            marginLeft="-1px"
                            paddingRight="4.5rem"
                            placeholder="0.0"
                            value={amount}
                            onChange={(event) => {
                                const { value } = event.target;
                                // Remove any characters that aren't digits or a period
                                let validValue = value.replace(/[^0-9.]/g, "");
                                // Remove leading zeros, but keep the number as a valid decimal
                                validValue = validValue.replace(/^0+(\d)/, "$1");
                                // If the string starts with a period, prepend a '0'
                                if (validValue.startsWith(".")) {
                                    validValue = `0${validValue}`;
                                }
                                setAmount(validValue);
                            }}
                            isInvalid={exceedingAmount}
                        />
                        {selectedToken && (
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    fontSize="smaller"
                                    onClick={() =>
                                        setAmount(
                                            toHumanReadable(selectedToken.balance, selectedToken.contract_decimals),
                                        )
                                    }
                                >
                                    MAX
                                </Button>
                            </InputRightElement>
                        )}
                    </InputGroup>
                </Box>
            </Box>
            <Button
                colorScheme={networkMismatch && safe ? "orange" : "green300"}
                rightIcon={<IoCashOutline size="25px" />}
                isLoading={sending}
                loadingText="Creating send transaction..."
                isDisabled={
                    !safe ||
                    !metaMaskInstalled ||
                    !address ||
                    walletMismatch ||
                    (!networkMismatch &&
                        (!selectedToken ||
                            !ethers.utils.isAddress(recipient) ||
                            !amount ||
                            Number(amount) === 0 ||
                            exceedingAmount))
                }
                onClick={async () => {
                    if (networkMismatch) {
                        const correctChain = chains.find((el) => {
                            // Check if fromNetwork is 'mainnet' and if so, ensure el.network is 'homestead'
                            if (networkName === "mainnet") {
                                return el.network === "homestead";
                            }
                            // Otherwise, match el.network with the fromNetwork
                            return el.network === networkName;
                        });
                        switchNetwork(correctChain.id);
                    } else {
                        setSending(true);
                        const success = await createAndApproveSendTransaction(
                            networkName,
                            safe,
                            {
                                to: selectedToken.native_token ? ethers.utils.getAddress(recipient) : erc20TokenAddress,
                                data: selectedToken.native_token ? "0x" : data,
                                value: selectedToken.native_token
                                    ? fromHumanReadable(amount, selectedToken.contract_decimals)
                                    : "0",
                            },
                            address,
                            satoshiData,
                        );
                        if (success) {
                            setSafe("");
                            setSelectedToken("");
                            setAmount("");
                            setRecipient("");
                        }
                        setSending(false);
                    }
                }}
            >
                {networkMismatch && safe
                    ? `Switch to ${upperFirst(networkName)} network`
                    : "Create and sign safe transaction"}
            </Button>
        </Stack>
    );
}
