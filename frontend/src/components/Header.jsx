import React, { useState } from "react";
import styled from "@emotion/styled";
import { PropTypes } from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    AlertIcon,
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
    Tooltip,
    Switch,
    useColorModeValue,
    useColorMode,
} from "@chakra-ui/react";
import { IoWalletOutline, IoPeopleOutline } from "react-icons/io5";
import { useUser } from "../providers/User";
import useAuth from "../hooks/useAuth";
import { useWagmi } from "../providers/Wagmi";
import ReactLogo from "../img/ReactLogo";
import SafesModal from "./SafesModal";

export default function Header({ withTeam }) {
    const bgValue = useColorModeValue("green300.500", "green300.300");
    const hoverBgValue = useColorModeValue("green300.600", "green300.400");
    const colorValue = useColorModeValue("white", "var(--chakra-colors-gray-700)");
    // for some reason gray.700 not working with styled()
    const { colorMode, toggleColorMode } = useColorMode();
    const { firestoreUser, currentTeam } = useUser();
    const { signOutUser, isSigningOut } = useAuth();
    const {
        preflightCheck,
        metaMaskInstalled,
        isConnected,
        connect,
        connectors,
        connectIsLoading,
        address,
        wallet,
        walletMismatch,
        chain,
        chains,
        switchNetwork,
        switchNetworkIsLoading,
    } = useWagmi();
    const [safesModalOpen, setSafesModalOpen] = useState(false);
    const [hoverActive, setHoverActive] = useState(false);
    const { slug } = useParams();
    const navigate = useNavigate();

    const StyledAvatarButton = styled(MenuButton)`
        border-radius: 16px;
        &:focus-visible {
            box-shadow: var(--chakra-shadows-outline);
        }
    `;

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
            <SafesModal isOpen={safesModalOpen} setIsOpen={setSafesModalOpen} />
            <Card direction="column" width="100%">
                <Flex direction="row" justify="space-between" padding="10px">
                    <Stack direction="row" spacing={8}>
                        <Box paddingLeft="10px" height="40px" width="150px" display="flex">
                            <ReactLogo />
                        </Box>
                        {withTeam && (
                            <>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => navigate(`/team/${slug}`)}
                                    color={colorMode === "light" && "var(--chakra-colors-gray-600)"}
                                >
                                    Home
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => navigate(`/team/${slug}/admin?tab=Safes`)}
                                    color={colorMode === "light" && "var(--chakra-colors-gray-600)"}
                                >
                                    Safes
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    color={colorMode === "light" && "var(--chakra-colors-gray-600)"}
                                >
                                    Docs
                                </Button>
                            </>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={4} align="center">
                        {currentTeam && currentTeam.name && (
                            <Tooltip label="Switch team">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/")}
                                    rightIcon={<IoPeopleOutline />}
                                >
                                    {currentTeam.name}
                                </Button>
                            </Tooltip>
                        )}
                        {!isConnected && withTeam && (
                            <Button
                                leftIcon={<IoWalletOutline />}
                                size="sm"
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
                                <StyledAvatarButton
                                    onMouseEnter={() => setHoverActive(true)}
                                    onMouseLeave={() => setHoverActive(false)}
                                >
                                    <StyledAvatar bg={hoverActive ? hoverBgValue : bgValue} size="sm" />
                                </StyledAvatarButton>
                                <MenuList>
                                    <MenuGroup title="Profile">
                                        <Box paddingLeft="3" paddingRight="3" paddingBottom="1">
                                            {firestoreUser?.displayName
                                                ? `${firestoreUser.displayName} (${firestoreUser?.email})`
                                                : firestoreUser?.email}
                                        </Box>
                                        {withTeam && (
                                            <MenuItem onClick={() => navigate(`/team/${slug}/admin?tab=Profile`)}>
                                                Manage Settings
                                            </MenuItem>
                                        )}
                                        <MenuItem onClick={signOutUser} isDisabled={isSigningOut}>
                                            Sign out
                                        </MenuItem>
                                    </MenuGroup>
                                    {withTeam && address && (
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
                                            colorScheme="green300"
                                        />
                                    </Box>
                                </MenuList>
                            </Menu>
                        </Box>
                    </Stack>
                </Flex>
                {withTeam && walletMismatch && (
                    <Flex>
                        <Alert
                            status="error"
                            variant="top-accent"
                            justifyContent="center"
                            borderBottomRadius="var(--chakra-radii-md)"
                        >
                            <AlertIcon />
                            The MetaMask wallet address you have selected does not match the wallet address registered
                            with Satoshi Safe.
                        </Alert>
                    </Flex>
                )}
            </Card>
        </Flex>
    );
}

Header.propTypes = {
    withTeam: PropTypes.bool,
};
