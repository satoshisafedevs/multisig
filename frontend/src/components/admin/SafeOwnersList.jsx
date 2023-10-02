/* eslint-disable react/forbid-prop-types */
import React from "react";
import { PropTypes } from "prop-types";
import { Avatar, HStack, Image, Icon, Tooltip } from "@chakra-ui/react";
import { FaQuestion } from "react-icons/fa"; // Import the question mark icon

function SafeOwnersList({ safe, teamUsersInfo }) {
    if (!safe || !safe.owners) {
        return null;
    }

    const transformed = Object.entries(teamUsersInfo).reduce((acc, [uid, data]) => {
        const { walletAddress, displayName, photoUrl } = data;
        if (!acc[walletAddress]) {
            acc[walletAddress] = {};
        }
        acc[walletAddress].uid = uid;
        acc[walletAddress].displayName = displayName;
        acc[walletAddress].photoUrl = photoUrl;
        return acc;
    }, {});

    return (
        <HStack>
            {safe.owners.map((owner) => {
                const ownerInfo = transformed[owner];
                if (ownerInfo && ownerInfo.photoUrl) {
                    return (
                        <Tooltip key={ownerInfo.uid} label={ownerInfo.displayName}>
                            <Image
                                key={ownerInfo.uid}
                                src={ownerInfo.photoUrl}
                                alt={ownerInfo.displayName}
                                title={ownerInfo.displayName}
                                maxHeight="48px"
                            />
                        </Tooltip>
                    );
                }
                if (ownerInfo) {
                    return (
                        <Tooltip key={ownerInfo.uid} label={ownerInfo.displayName}>
                            <Avatar key={ownerInfo.uid} name={ownerInfo.displayName} />
                        </Tooltip>
                    );
                }
                return (
                    <Tooltip key={owner} label={owner}>
                        <Avatar key={owner}>
                            <Icon as={FaQuestion} boxSize={4} />
                        </Avatar>
                    </Tooltip>
                );
            })}
        </HStack>
    );
}

export default SafeOwnersList;

SafeOwnersList.propTypes = {
    safe: PropTypes.object,
    teamUsersInfo: PropTypes.object,
};
