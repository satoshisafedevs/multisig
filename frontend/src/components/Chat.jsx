import React, { useEffect, useState, useRef } from "react";
import styled from "@emotion/styled";
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Input,
    Text,
    Stack,
    useColorModeValue,
} from "@chakra-ui/react";
import { IoSend, IoTrash } from "react-icons/io5";
import useAuth from "../hooks/useAuth";
import { useFirestoreUser } from "../providers/FirestoreUser";
import DeleteMessageModal from "./DeleteMessageModal";

export default function Chat() {
    const { firestoreUser, teamMembers } = useFirestoreUser();
    const { user, db, doc, getDoc, onSnapshot, addMessage } = useAuth();
    const colorValue = useColorModeValue("gray.200", "whiteAlpha.200");
    const [chatEnabled, setChatEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageID, setMessageID] = useState();
    const [hoverID, setHoverID] = useState();
    const lastMessage = useRef();

    const StyledTrashIcon = styled(IoTrash)`
        &:hover {
            fill: tomato;
            cursor: pointer;
        }
    `;

    useEffect(() => {
        if (messages && lastMessage.current) {
            lastMessage.current.scrollIntoView();
        }
    }, [messages]);

    useEffect(() => {
        const checkUserTeam = async () => {
            if (firestoreUser?.team) {
                const docRef = doc(db, "teams", firestoreUser.team);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setChatEnabled(true);
                }
            }
        };
        checkUserTeam();
        let unsubscribe = () => {};
        if (firestoreUser?.team) {
            unsubscribe = onSnapshot(doc(db, "teams", firestoreUser.team, "chat", "messages"), (el) => {
                const chatMessages = el.data();
                if (chatMessages) {
                    const sortByTimestamp = Object.fromEntries(
                        Object.entries(chatMessages).sort((a, b) => a[0].localeCompare(b[0])),
                    );
                    setMessages(sortByTimestamp);
                }
            });
        }
        return unsubscribe;
    }, [firestoreUser]);

    const handleText = (event) => setMessage(event.target.value);

    const dateOptions = {
        timeZone: "America/Los_Angeles",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const timeOptions = {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const convertToDate = (timestamp) => new Date(Number(timestamp)).toLocaleString("en-US", dateOptions);

    const convertToTime = (timestamp) => new Date(Number(timestamp)).toLocaleString("en-US", timeOptions);

    const isSameDate = (ts) => {
        const date1 = new Date(Number(ts));
        const date2 = new Date();

        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const handleDelete = (key) => {
        setDeleteModalOpen(true);
        setMessageID(key);
    };

    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Text fontSize="lg" fontWeight="bold">
                    Control panel
                </Text>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="10px" paddingBottom="5px">
                <DeleteMessageModal
                    messageID={messageID}
                    isOpen={deleteModalOpen}
                    setIsOpen={setDeleteModalOpen}
                    setHoverID={setHoverID}
                />
                {chatEnabled && (
                    <Stack spacing="3">
                        {Object.entries(messages).map(([key, value]) => (
                            <Stack
                                direction="row"
                                align="center"
                                key={key}
                                spacing="0"
                                paddingLeft="3px"
                                _hover={{ backgroundColor: colorValue, borderRadius: "3px" }}
                                onMouseEnter={() => setHoverID(key)}
                                onMouseLeave={() => setHoverID(null)}
                            >
                                <Avatar name={teamMembers[value.uid].displayName || value.from} size="sm" />
                                <Box flexGrow="1" paddingLeft="6px">
                                    <Stack direction="row">
                                        <Text fontSize="xs" fontWeight="bold">
                                            {teamMembers[value.uid].displayName || value.from}
                                        </Text>
                                        <Text fontSize="xs">
                                            {isSameDate(key) ? convertToTime(key) : convertToDate(key)}
                                        </Text>
                                    </Stack>
                                    <Text fontSize="xs">{value.message}</Text>
                                </Box>
                                {user && user.uid === value.uid && key === hoverID && (
                                    <IconButton
                                        icon={<StyledTrashIcon />}
                                        onClick={() => handleDelete(key)}
                                        height="36px"
                                        width="36px"
                                        borderRadius="3px"
                                        background="none"
                                        _hover={{ background: "none", cursor: "default" }}
                                    />
                                )}
                                <Box ref={lastMessage} />
                            </Stack>
                        ))}
                    </Stack>
                )}
            </CardBody>
            <CardFooter paddingTop="5px">
                {chatEnabled && (
                    <>
                        <Input
                            placeholder="Chat or action"
                            value={message}
                            onChange={handleText}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && message.trim().length !== 0) {
                                    addMessage(message.trim());
                                    setMessage("");
                                }
                            }}
                        />
                        <Box>
                            <Button
                                marginLeft="20px"
                                colorScheme="green300"
                                rightIcon={<IoSend size="20px" />}
                                onClick={() => {
                                    if (message.trim().length !== 0) {
                                        addMessage(message.trim());
                                        setMessage("");
                                    }
                                }}
                            >
                                Send
                            </Button>
                        </Box>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
