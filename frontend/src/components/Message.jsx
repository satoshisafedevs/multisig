import React, { memo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { Stack, Avatar, Box, Text, IconButton, useColorModeValue } from "@chakra-ui/react";
import { IoTrash } from "react-icons/io5";
import { useUser } from "../providers/User";
import DeleteMessageModal from "./DeleteMessageModal";
import theme from "../theme";

const StyledTrashIcon = styled(IoTrash)`
    &:hover {
        fill: tomato;
        cursor: pointer;
    }
`;

function Message({ message, hoverID, setHoverID }) {
    const { firestoreUser, teamUsersInfo } = useUser();
    const satoshiColor = useColorModeValue(theme.colors.blueSwatch[700], theme.colors.blueSwatch[200]);
    const backgroundHover = useColorModeValue("gray.100", "whiteAlpha.200");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageID, setMessageID] = useState();

    const handleMouseEnter = useCallback(
        (id) => {
            setHoverID(id);
        },
        [setHoverID],
    );

    const handleMouseLeave = useCallback(() => {
        setHoverID(null);
    }, [setHoverID]);

    const renderMessage = (msg) => {
        const satoshi = "@satoshi";
        if (msg.message.length === 0) {
            return "(no message)";
        }
        if (msg.message.includes(satoshi)) {
            const textParts = msg.message.split(satoshi);
            return textParts.map((part, index) => (
                <React.Fragment key={part}>
                    {index > 0 && <span style={{ color: satoshiColor }}>@satoshi</span>}
                    {part}
                </React.Fragment>
            ));
        }
        return msg.message;
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const timeInMilliseconds = (ts) => ts.seconds * 1000 + ts.nanoseconds / 1e6;

    const convertToDate = (ts) => {
        // Assuming timeInMilliseconds(ts) properly converts your timestamp 'ts' to milliseconds
        const date = new Date(timeInMilliseconds(ts));
        const currentYear = new Date().getFullYear();
        const dateYear = date.getFullYear();

        // Define the base dateOptions without a fixed timeZone
        const dateOptions = {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };

        // If the date is from a past year, include the year in the options
        if (dateYear < currentYear) {
            dateOptions.year = "numeric";
        }

        // Return the formatted date string with or without the year based on the date
        return date.toLocaleString("en-US", dateOptions);
    };

    const convertToTime = (ts) => new Date(timeInMilliseconds(ts)).toLocaleTimeString("en-US", timeOptions);

    const isToday = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const today = new Date();

        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const isYesterday = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // set to yesterday's date

        return (
            date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate()
        );
    };

    const messageTimeFormat = (key) => {
        if (isToday(key)) {
            return `Today at ${convertToTime(key)}`;
        }
        if (isYesterday(key)) {
            return `Yesterday at ${convertToTime(key)}`;
        }
        return convertToDate(key);
    };

    const handleDelete = (key) => {
        setDeleteModalOpen(true);
        setMessageID(key);
    };

    if (teamUsersInfo && teamUsersInfo[message.uid]) {
        return (
            <>
                <DeleteMessageModal
                    messageID={messageID}
                    isOpen={deleteModalOpen}
                    setIsOpen={setDeleteModalOpen}
                    setHoverID={setHoverID}
                />
                <Stack
                    direction="row"
                    align="center"
                    spacing="0"
                    paddingLeft="10px"
                    paddingTop="2px"
                    paddingBottom="2px"
                    _hover={{ backgroundColor: backgroundHover, borderRadius: "5px" }}
                    onMouseEnter={() => handleMouseEnter(message.id)}
                    onMouseLeave={handleMouseLeave}
                >
                    <Avatar
                        size="sm"
                        alt={teamUsersInfo[message.uid].displayName ? teamUsersInfo[message.uid].displayName : null}
                        src={teamUsersInfo[message.uid].photoUrl ? teamUsersInfo[message.uid].photoUrl : null}
                        name={teamUsersInfo[message.uid].displayName ? teamUsersInfo[message.uid].displayName : null}
                    />
                    <Box flexGrow="1" paddingLeft="6px">
                        <Stack direction="row" spacing="5px">
                            <Text fontSize="xs" fontWeight="bold">
                                {teamUsersInfo && teamUsersInfo[message.uid] && teamUsersInfo[message.uid].displayName
                                    ? teamUsersInfo[message.uid].displayName
                                    : "No name"}
                            </Text>
                            <Text fontSize="xs">{messageTimeFormat(message.createdAt)}</Text>
                        </Stack>
                        <Text fontSize="xs">{renderMessage(message)}</Text>
                    </Box>
                    {firestoreUser && firestoreUser.uid === message.uid && message.id === hoverID && (
                        <IconButton
                            icon={<StyledTrashIcon />}
                            onClick={() => handleDelete(message.id)}
                            height="36px"
                            width="36px"
                            borderRadius="3px"
                            background="none"
                            _hover={{ background: "none", cursor: "default" }}
                        />
                    )}
                </Stack>
            </>
        );
    }
    return null;
}

Message.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    message: PropTypes.any,
    hoverID: PropTypes.string,
    setHoverID: PropTypes.func.isRequired,
};

export default memo(Message);
