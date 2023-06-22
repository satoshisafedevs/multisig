import React from "react";
import styled from "@emotion/styled";
import {
    Avatar,
    Box,
    Button,
    Card,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuGroup,
    MenuList,
    MenuItem,
    MenuDivider,
    Stack,
    Flex,
    Image,
    Switch,
    useColorModeValue,
    useColorMode,
} from "@chakra-ui/react";
import { IoWalletOutline } from "react-icons/io5";
import useAuth from "../hooks/useAuth";
import useWagmi from "../hooks/useWagmi";
import theme from "../theme";

const logo =
    "https://firebasestorage.googleapis.com/v0/b/" +
    "prontoai-playground.appspot.com/o/logo%2Fsatoshi_safe.png?alt=media&token=b5333920-3b92-447c-93b3-2b5f6e34c09e";

export default function Header() {
    const bgValue = useColorModeValue("green300.500", "green300.300");
    const colorValue = useColorModeValue("white", theme.colors.gray[700]);
    // for some reason gray.700 not working with styled()
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, signOutUser, isSigningOut } = useAuth();
    const {
        preflightCheck,
        metaMaskInstalled,
        isConnected,
        connect,
        connectors,
        connectIsLoading,
        address,
        wallet,
        chain,
        chains,
        switchNetwork,
        switchNetworkIsLoading,
    } = useWagmi();

    const StyledAvatar = styled(Avatar)`
        svg {
            color: ${colorValue};
        }
    `;

    const buttonLabel = () => {
        if (preflightCheck) {
            return "Preflight check...";
        }
        if (!metaMaskInstalled) {
            return "Please install MetaMask, sign in, and then refresh this page";
        }
        if (connectIsLoading) {
            return "Approve connection with MetaMask";
        }
        return "Connect to MetaMask";
    };

    const setColorScheme = () => {
        if (preflightCheck) {
            return "gray";
        }
        if (!metaMaskInstalled) {
            return "orange";
        }
        return "green300";
    };

    const handleClick = () => {
        if (!metaMaskInstalled) {
            window.open("https://metamask.io/download/", "_blank");
            return;
        }
        connect({
            connector: connectors.find((connector) => connector.name === "MetaMask"),
        });
    };

    const walletValue = () => {
        if (wallet) {
            if (Number(wallet.formatted) % 1 === 0) {
                return ` - ${wallet.formatted} ${wallet.symbol}`;
            }
            return ` - ${Number(wallet.formatted).toFixed(6)} ${wallet.symbol}`;
        }
        return null;
    };

    return (
        <Flex margin="10px 10px 0 10px">
            <Card direction="row" width="100%" justify="space-between" padding="10px">
                <Stack direction="row" spacing={8}>
                    <Image src={logo} width="170px" />
                    <Button variant="link" size="sm">
                        Security center
                    </Button>
                    <Button variant="link" size="sm">
                        Reports
                    </Button>
                    <Button variant="link" size="sm">
                        Docs
                    </Button>
                </Stack>
                <Stack direction="row" spacing={4} align="center">
                    {!isConnected && (
                        <Button
                            leftIcon={<IoWalletOutline />}
                            size="sm"
                            width="100%"
                            colorScheme={setColorScheme()}
                            isDisabled={preflightCheck || connectIsLoading}
                            onClick={handleClick}
                        >
                            {buttonLabel()}
                        </Button>
                    )}
                    {/* Box wrapper fixes warning in console */}
                    <Box>
                        <Menu>
                            <MenuButton>
                                <StyledAvatar bg={bgValue} size="sm" />
                            </MenuButton>
                            <MenuList>
                                <MenuGroup title="Profile">
                                    <Box paddingLeft="3" paddingRight="3">
                                        {user?.displayName ? `${user.displayName} (${user?.email})` : user?.email}
                                    </Box>
                                    <MenuItem onClick={signOutUser} isDisabled={isSigningOut}>
                                        Sign out
                                    </MenuItem>
                                </MenuGroup>
                                {address && (
                                    <>
                                        <MenuDivider />
                                        <MenuGroup title="Wallet">
                                            <Box paddingLeft="3" paddingBottom="1" paddingRight="3">
                                                {address.slice(0, 5)}
                                                ...
                                                {address.slice(-4)}
                                                {walletValue()}
                                            </Box>
                                            <Box paddingLeft="3" paddingBottom="1" paddingRight="3">
                                                <Menu>
                                                    <MenuButton fontWeight="normal" as={Button}>
                                                        Network {chain.name}
                                                    </MenuButton>
                                                    <MenuList>
                                                        {chains.map((el) => (
                                                            <MenuItemOption
                                                                key={el.name}
                                                                vale={el.name}
                                                                isChecked={el.name === chain.name}
                                                                type="checkbox"
                                                                onClick={() => switchNetwork(el.id)}
                                                                isDisabled={switchNetworkIsLoading}
                                                            >
                                                                {el.name}
                                                            </MenuItemOption>
                                                        ))}
                                                    </MenuList>
                                                </Menu>
                                            </Box>
                                        </MenuGroup>
                                    </>
                                )}
                                <MenuDivider />
                                <Box paddingLeft="3" paddingBottom="1">
                                    Dark theme
                                    <Switch
                                        paddingLeft="3"
                                        size="md"
                                        onChange={toggleColorMode}
                                        isChecked={colorMode !== "light"}
                                    />
                                </Box>
                            </MenuList>
                        </Menu>
                    </Box>
                </Stack>
            </Card>
        </Flex>
    );
}
