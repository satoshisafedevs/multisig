import {
    Alert,
    AlertIcon,
    Avatar,
    Box,
    Button,
    Card,
    Flex,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuItemOption,
    MenuList,
    Stack,
    Switch,
    Tooltip,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { isEmpty } from "lodash";
import moment from "moment";
import { PropTypes } from "prop-types";
import React, { useState } from "react";
import { IoInformationCircleOutline, IoPeopleOutline, IoWalletOutline, IoWarning } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ReactLogo from "../img/ReactLogo";
import { useUser } from "../providers/User";
import { useWagmi } from "../providers/Wagmi";
import FreeTrialExpiredModal from "./FreeTrialExpiredModal";
import SubscribeModal from "./SubscribeModal";
import NoSubscriptionModal from "./NoSubscriptionModal";
import { useSubscriptions } from "../providers/Subscriptions";

export default function Header({ withTeam }) {
    const bgValue = useColorModeValue("bronzeSwatch.500", "bronzeSwatch.300");
    const hoverBgValue = useColorModeValue("bronzeSwatch.600", "bronzeSwatch.400");
    const colorValue = useColorModeValue("white", "var(--chakra-colors-gray-700)");
    // for some reason gray.700 not working with styled()
    const { colorMode, toggleColorMode } = useColorMode();
    const { firestoreUser, currentTeam, userTeamData, teamsData } = useUser();
    const { activeSubscriptions } = useSubscriptions();
    const { signOutUser, isSigningOut } = useAuth();
    const {
        preflightCheck,
        metaMaskInstalled,
        isConnected,
        connect,
        connectors,
        connectIsLoading,
        pendingConnector,
        address,
        wallet,
        walletMismatch,
        chain,
        chains,
        switchNetwork,
    } = useWagmi();
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
            return "Please install MetaMask and refresh this page";
        }
        if (connectIsLoading) {
            return "Approve connection with MetaMask";
        }
        if (!isEmpty(pendingConnector)) {
            return "Unlock MetaMask";
        }
        return "Connect to MetaMask";
    };

    const setColorScheme = () => {
        if (preflightCheck) {
            return "blueSwatch";
        }
        if (!metaMaskInstalled) {
            return "blueSwatch";
        }
        return "blueSwatch";
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

    const walletMismatchText =
        "The wallet address selected in your MetaMask app does not match the wallet address in your profile.";

    const notSafeOwner =
        currentTeam?.safes &&
        userTeamData?.userWalletAddress &&
        currentTeam.safes.some((s) => !s.owners.includes(userTeamData.userWalletAddress));

    const notSafeOwnerText = "The wallet address in your Profile does not belong to the owners of one or more Safes.";
    const activeSubscription = currentTeam
        ? (activeSubscriptions || []).find((s) => s.team?.id === currentTeam.id)
        : null;
    const renderTrialExpiration = (subscription) => {
        if (subscription) {
            if (activeSubscription.status === "ACTIVE") {
                return;
            }
            if (activeSubscription.trialEndDate) {
                const trialEndMoment = moment(activeSubscription.trialEndDate);
                const daysUntillEnd = trialEndMoment.diff(moment(), "days");
                const label = trialEndMoment.isBefore(moment())
                    ? "Free trial expired."
                    : `Free trial expires ${moment().to(trialEndMoment)}.`;
                let backgroundColor;
                let icon;
                if (daysUntillEnd <= 7) {
                    backgroundColor = "red";
                    icon = <IoWarning />;
                } else if (daysUntillEnd > 7 && daysUntillEnd <= 14) {
                    backgroundColor = "orange";
                    icon = <IoInformationCircleOutline />;
                } else {
                    // backgroundColor = "grey";
                    icon = <IoInformationCircleOutline />;
                }

                return (
                    <Button
                        size="sm"
                        onClick={() => navigate(`/team/${slug}/admin?tab=Billing`)}
                        rightIcon={icon}
                        colorScheme={backgroundColor}
                    >
                        {label}
                    </Button>
                );
            }
        }
    };

    const teamsAvailable = teamsData && teamsData.length > 0;

    return (
        <Flex margin="10px 10px 0 10px">
            <Card direction="column" width="100%">
                <Flex direction="row" justify="space-between" padding="10px">
                    <Stack direction="row" spacing={8} alignItems="center">
                        <Box paddingLeft="5px" height="24px" display="flex">
                            <ReactLogo
                                satoshiTextColor={
                                    colorMode === "light"
                                        ? "var(--chakra-colors-blackAlpha-900)"
                                        : "var(--chakra-colors-whiteAlpha-900)"
                                }
                            />
                        </Box>
                        {withTeam && teamsAvailable && (
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
                                    onClick={() => navigate(`/team/${slug}/admin?tab=Profile`)}
                                    color={colorMode === "light" && "var(--chakra-colors-gray-600)"}
                                >
                                    Settings
                                </Button>
                                <Button
                                    variant="link"
                                    size="sm"
                                    color={colorMode === "light" && "var(--chakra-colors-gray-600)"}
                                    onClick={() => window.open("https://docs.getsatoshisafe.com/wallet", "_blank")}
                                >
                                    Docs
                                </Button>
                            </>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={4} align="center">
                        {renderTrialExpiration(activeSubscription)}
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
                        {!isConnected && withTeam && teamsAvailable && (
                            <Button
                                rightIcon={<IoWalletOutline />}
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
                                    onMouseEnter={() => !firestoreUser?.photoURL && setHoverActive(true)}
                                    onMouseLeave={() => !firestoreUser?.photoURL && setHoverActive(false)}
                                >
                                    <StyledAvatar
                                        bg={hoverActive ? hoverBgValue : bgValue}
                                        size="sm"
                                        src={firestoreUser?.photoURL}
                                    />
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
                                                            Network{" "}
                                                            {chain.name === "OP Mainnet" ? "Optimism" : chain.name}
                                                        </MenuButton>
                                                        <MenuList>
                                                            {chains.map((el) => (
                                                                <MenuItemOption
                                                                    key={el.name}
                                                                    isChecked={el.name === chain.name}
                                                                    type="checkbox"
                                                                    onClick={() => switchNetwork(el.id)}
                                                                >
                                                                    {el.name === "OP Mainnet" ? "Optimism" : el.name}
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
                                            colorScheme="blueSwatch"
                                        />
                                    </Box>
                                </MenuList>
                            </Menu>
                        </Box>
                    </Stack>
                </Flex>
                {withTeam && (walletMismatch || notSafeOwner) && (
                    <Flex>
                        <Alert
                            status="error"
                            variant="top-accent"
                            justifyContent="center"
                            borderBottomRadius="var(--chakra-radii-md)"
                        >
                            <AlertIcon />
                            {walletMismatch && walletMismatchText}
                            {walletMismatch && notSafeOwner && " "}
                            {notSafeOwner && notSafeOwnerText}
                        </Alert>
                    </Flex>
                )}
            </Card>
            <FreeTrialExpiredModal
                isOpen={
                    currentTeam?.ownerId === firestoreUser?.uid &&
                    activeSubscription &&
                    moment(activeSubscription.trialEndDate).isBefore(moment()) === true &&
                    activeSubscription.status !== "ACTIVE"
                }
            />
            <SubscribeModal isOpen={!activeSubscription && currentTeam && currentTeam.ownerId === firestoreUser?.uid} />
            <NoSubscriptionModal
                isOpen={currentTeam && currentTeam.ownerId !== firestoreUser?.uid && !activeSubscription}
            />
        </Flex>
    );
}

Header.propTypes = {
    withTeam: PropTypes.bool,
};
