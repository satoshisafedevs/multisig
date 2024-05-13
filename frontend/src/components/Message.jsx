import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import {
    Stack,
    Avatar,
    Alert,
    AlertIcon,
    Box,
    Text,
    IconButton,
    Button,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Input,
    Heading,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { IoTrash, IoSend, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { db, collection, addDoc, Timestamp, onSnapshot, doc, getDoc, updateDoc } from "../firebase";
import { useUser } from "../providers/User";
import DeleteMessageModal from "./DeleteMessageModal";
import theme from "../theme";
import ThreadMessage from "./ThreadMessage";
import LastReply from "./LastReply";

const StyledTrashIcon = styled(IoTrash)`
    &:hover {
        fill: tomato;
        cursor: pointer;
    }
`;

const StyledTreadIcon = styled(IoChatbubbleEllipsesOutline)`
    &:hover {
        fill: tomato;
        cursor: pointer;
    }
`;

function Message({ message }) {
    const { firestoreUser, teamUsersInfo, currentTeam } = useUser();
    const satoshiColor = useColorModeValue(theme.colors.blueSwatch[700], theme.colors.blueSwatch[200]);
    const backgroundHover = useColorModeValue("gray.100", "#3d4756");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageID, setMessageID] = useState();
    const [hoverID, setHoverID] = useState();
    const [threadMessage, setThreadMessage] = useState("");
    const [threadMessages, setThreadMessages] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();
    const toast = useToast();
    const lastMessage = useRef();

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

    useEffect(() => {
        if (isOpen && threadMessages.length > 0 && lastMessage.current) {
            lastMessage.current.scrollIntoView(); // Scroll to the bottom
        }
    }, [isOpen, threadMessages, lastMessage.current]);

    useEffect(() => {
        if (!currentTeam || !currentTeam.id) return;
        const messagesRef = collection(db, "teams", currentTeam.id, "messages", message.id, "thread");

        let unsubscribe = () => {};
        try {
            unsubscribe = onSnapshot(messagesRef, (querySnapshot) => {
                const chatMessages = querySnapshot.docs
                    .map((msg) => ({
                        ...msg.data(),
                        id: msg.id,
                    }))
                    .sort((a, b) => a.createdAt - b.createdAt);
                setThreadMessages(chatMessages);
            });
        } catch (error) {
            toast({
                description: `Failed to get thread messages: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }

        return unsubscribe;
    }, [currentTeam]);

    const addThreadMessage = async (parentMessageID, text) => {
        try {
            const type = "text";
            const newThreadMessage = {
                message: text,
                uid: firestoreUser.uid,
                type,
                createdAt: Timestamp.now(),
            };
            // Points to the 'threads' subcollection under the specific parent message in the team document
            const threadsCollectionRef = collection(db, "teams", currentTeam.id, "messages", parentMessageID, "thread");
            // Add a new document with 'newMessage' object to the 'threads' subcollection
            await addDoc(threadsCollectionRef, newThreadMessage);
            const messageDoc = doc(db, "teams", currentTeam.id, "messages", parentMessageID);
            const messageSnap = await getDoc(messageDoc);
            const newThreadCount = (messageSnap.data().threadCount || 0) + 1;
            await updateDoc(messageDoc, { threadCount: newThreadCount, threadLastReply: Timestamp.now() });
        } catch (error) {
            toast({
                description: `Failed to send message: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
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

    // Helper function to remove time from date
    const stripTime = (date) => {
        const stripped = new Date(date);
        stripped.setHours(0, 0, 0, 0);
        return stripped;
    };

    // Function to check if a timestamp is today
    const isToday = (ts) => {
        const today = new Date();
        const date = new Date(timeInMilliseconds(ts));
        return stripTime(date).getTime() === stripTime(today).getTime();
    };

    // Function to check if a timestamp is yesterday
    const isYesterday = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return stripTime(date).getTime() === stripTime(yesterday).getTime();
    };

    // Function to check if a timestamp is within the last week
    const isWithinLastWeek = (ts) => {
        const date = new Date(timeInMilliseconds(ts));
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return stripTime(date) > stripTime(weekAgo) && !isToday(ts) && !isYesterday(ts);
    };

    // Function to format message time based on how recent it is
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
                {deleteModalOpen && (
                    <DeleteMessageModal
                        messageID={messageID}
                        isOpen={deleteModalOpen}
                        setIsOpen={setDeleteModalOpen}
                        setHoverID={setHoverID}
                    />
                )}
                {isOpen && (
                    <Drawer
                        isOpen={isOpen}
                        size="md"
                        placement="right"
                        onClose={onClose}
                        finalFocusRef={btnRef}
                        preserveScrollBarGap
                    >
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerCloseButton top="var(--chakra-space-3)" />
                            <DrawerHeader>
                                <Heading size="md">Thread</Heading>
                            </DrawerHeader>
                            <DrawerBody>
                                <Stack spacing="2">
                                    {threadMessages?.length > 0 ? (
                                        threadMessages.map((el) => (
                                            <ThreadMessage key={el.id} parentMessageID={message.id} message={el} />
                                        ))
                                    ) : (
                                        <Alert
                                            status="info"
                                            colorScheme="blueSwatch"
                                            borderRadius="var(--chakra-radii-base)"
                                        >
                                            <AlertIcon />
                                            This thread is empty.
                                        </Alert>
                                    )}
                                </Stack>
                                <Box ref={lastMessage} />
                            </DrawerBody>
                            <DrawerFooter gap="20px">
                                <Input
                                    placeholder="Write a reply..."
                                    value={threadMessage}
                                    onChange={(event) => setThreadMessage(event.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && threadMessage.trim().length !== 0) {
                                            setThreadMessage("");
                                            addThreadMessage(message.id, threadMessage.trim());
                                        }
                                    }}
                                />
                                <Button
                                    colorScheme="blueSwatch"
                                    rightIcon={<IoSend size="20px" />}
                                    onClick={() => {
                                        if (threadMessage.trim().length !== 0) {
                                            setThreadMessage("");
                                            addThreadMessage(message.id, threadMessage.trim());
                                        }
                                    }}
                                >
                                    &nbsp;Reply
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                )}
                <Stack
                    position="relative"
                    direction="row"
                    align="center"
                    spacing="0"
                    padding="4px 4px 4px 10px"
                    _hover={{ backgroundColor: backgroundHover, borderRadius: "5px" }}
                    onMouseEnter={() => handleMouseEnter(message.id)}
                    onMouseLeave={handleMouseLeave}
                >
                    {hoverID && (
                        <Box
                            position="absolute"
                            top="-1"
                            right="-1"
                            minHeight="30px"
                            border="1px solid var(--chakra-colors-chakra-border-color)"
                            borderRadius="base"
                            backgroundColor={backgroundHover}
                            alignContent="center"
                        >
                            <Stack display="flex" flexDirection="row" spacing="4" padding="0 10px">
                                <Tooltip
                                    label="Reply in thread"
                                    placement={firestoreUser?.uid === message?.uid ? "top" : "top-end"}
                                >
                                    <IconButton
                                        icon={<StyledTreadIcon />}
                                        onClick={onOpen}
                                        height="unset"
                                        minWidth="unset"
                                        background="none"
                                        _hover={{ background: "none", cursor: "default" }}
                                    />
                                </Tooltip>
                                {firestoreUser && firestoreUser.uid === message.uid && message.id === hoverID && (
                                    <Tooltip label="Delete" placement="top-end">
                                        <IconButton
                                            icon={<StyledTrashIcon />}
                                            onClick={() => handleDelete(message.id)}
                                            height="unset"
                                            minWidth="unset"
                                            background="none"
                                            _hover={{ background: "none", cursor: "default" }}
                                        />
                                    </Tooltip>
                                )}
                            </Stack>
                        </Box>
                    )}

                    <Avatar
                        size="sm"
                        alt={teamUsersInfo[message.uid].displayName ? teamUsersInfo[message.uid].displayName : null}
                        src={teamUsersInfo[message.uid].photoUrl ? teamUsersInfo[message.uid].photoUrl : null}
                        name={teamUsersInfo[message.uid].displayName ? teamUsersInfo[message.uid].displayName : null}
                    />
                    <Box flexGrow="1" paddingLeft="6px" paddingBottom="1px">
                        <Stack direction="row" spacing="5px">
                            <Text fontSize="xs" fontWeight="bold">
                                {teamUsersInfo && teamUsersInfo[message.uid] && teamUsersInfo[message.uid].displayName
                                    ? teamUsersInfo[message.uid].displayName
                                    : "No name"}
                            </Text>
                            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                                {messageTimeFormat(message.createdAt)}
                            </Text>
                        </Stack>
                        <Text fontSize="xs">{renderMessage(message)}</Text>
                        {message?.threadCount > 0 && (
                            <Box display="flex" flexDirection="row">
                                <Text fontSize="xs">
                                    <Button
                                        variant="link"
                                        size="xs"
                                        fontWeight="normal"
                                        color="blue3"
                                        onClick={onOpen}
                                        paddingRight="5px"
                                    >
                                        {message.threadCount} {message.threadCount === 1 ? "reply" : "replies"}
                                    </Button>
                                </Text>
                                {message.threadLastReply && (
                                    <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                                        <LastReply message={message} />
                                    </Text>
                                )}
                            </Box>
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
