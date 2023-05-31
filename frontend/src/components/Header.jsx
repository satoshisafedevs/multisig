import React from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Menu,
    MenuButton,
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
import logo from "../img/logo.svg";
import useAuth from "../hooks/useAuth";

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, signOutUser, isSigningOut } = useAuth();
    const filterValue = useColorModeValue("invert(90%)", "none");

    return (
        <Flex margin="10px 10px 0 10px">
            <Card
                direction="row"
                width="100%"
                justify="space-between"
                padding="10px"
            >
                <Image src={logo} filter={filterValue} width="170px" />
                <Stack direction="row" spacing={4} align="center">
                    <Button
                        leftIcon={<IoWalletOutline />}
                        size="sm"
                        width="100%"
                        colorScheme="green300"
                    >
                        Connect to Metamask
                    </Button>
                    <Menu>
                        <MenuButton>
                            <Avatar size="sm" />
                        </MenuButton>
                        <MenuList>
                            <Box paddingLeft="3" paddingBottom="4">
                                {user?.email}
                            </Box>
                            <Box paddingLeft="3" paddingBottom="1">
                                Dark theme{" "}
                                <Switch
                                    paddingLeft="2"
                                    size="md"
                                    onChange={toggleColorMode}
                                    isChecked={colorMode !== "light"}
                                />
                            </Box>
                            <MenuDivider />
                            <MenuItem
                                onClick={signOutUser}
                                isDisabled={isSigningOut}
                            >
                                Sign out
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Stack>
            </Card>
        </Flex>
    );
}
