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

function Message({ message }) {
    const { firestoreUser, teamUsersInfo } = useUser();
    const satoshiColor = useColorModeValue(theme.colors.blueSwatch[700], theme.colors.blueSwatch[200]);
    const backgroundHover = useColorModeValue("gray.100", "whiteAlpha.200");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageID, setMessageID] = useState();
    const [hoverID, setHoverID] = useState();

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
        const date = new Date(timeInMilliseconds(ts));
        const currentYear = new Date().getFullYear();
        const dateYear = date.getFullYear();

        const dateOptions = {
            month: "short",
            day: "numeric",
        };

        if (dateYear < currentYear) {
            dateOptions.year = "numeric";
        }

        // Convert the date to a locale string but without including the time.
        const dateString = date.toLocaleDateString("en-US", dateOptions);
        // Extract the time separately to insert 'at' in between.
        const timeString = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // Combine the date and time with 'at'
        return `${dateString} at ${timeString}`;
    };

    const convertToTime = (ts) => new Date(timeInMilliseconds(ts)).toLocaleTimeString("en-US", timeOptions);

    const isToday = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        return date.toDateString() === new Date().toDateString();
    };

    const isYesterday = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
    };

    const isWithinLastWeek = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo && !isToday(ts) && !isYesterday(ts);
    };

    const messageTimeFormat = (key) => {
        if (isToday(key)) {
            return `Today ${convertToTime(key)}`;
        }
        if (isYesterday(key)) {
            return `Yesterday ${convertToTime(key)}`;
        }
        if (isWithinLastWeek(key)) {
            const dayOfWeek = new Date(timeInMilliseconds(key)).toLocaleDateString("en-US", { weekday: "long" });
            return `${dayOfWeek} ${convertToTime(key)}`;
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
                        <Text fontSize="xs" paddingBottom="2px">
                            {renderMessage(message)}
                        </Text>
                    </Box>
                    <Box width="45px">
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
                    </Box>
                </Stack>
            </>
        );
    }
    return null;
}

Message.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    message: PropTypes.any,
};

export default memo(Message);
