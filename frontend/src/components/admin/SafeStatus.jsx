/* eslint-disable react/forbid-prop-types */
import React from "react";
import { PropTypes } from "prop-types";
import { HStack, Icon, Tooltip } from "@chakra-ui/react";
import { IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5"; // Import icons from io5

function UnregisteredSafeOwnersAlert({ safe, teamUsersInfo }) {
    if (!safe || !safe.owners) {
        return null;
    }

    // Create a Set of registered wallet addresses from teamUsersInfo
    const registeredWalletAddresses = new Set(Object.values(teamUsersInfo).map((info) => info.walletAddress));

    // Check if all safe owners are registered on the platform
    const allOwnersRegistered = safe.owners.every((owner) => registeredWalletAddresses.has(owner));

    if (allOwnersRegistered) {
        // All owners are registered, display success icon
        return (
            <Tooltip label="All safe owners are registered on the platform.">
                <HStack>
                    <Icon as={IoCheckmarkCircle} color="green.500" boxSize={8} />
                </HStack>
            </Tooltip>
        );
    }
    // Some owners aren't registered, display warning icon
    const tooltipMessage = "Some safe owners haven't registered on the platform yet.";
    return (
        <Tooltip label={tooltipMessage}>
            <HStack>
                <Icon as={IoAlertCircle} color="yellow.500" boxSize={8} />
            </HStack>
        </Tooltip>
    );
}

export default UnregisteredSafeOwnersAlert;

UnregisteredSafeOwnersAlert.propTypes = {
    safe: PropTypes.object,
    teamUsersInfo: PropTypes.object,
};
