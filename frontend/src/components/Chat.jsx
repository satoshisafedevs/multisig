import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
    Heading,
} from "@chakra-ui/react";
import { IoSend, IoTrash } from "react-icons/io5";
import useAuth from "../hooks/useAuth";
import DeleteMessageModal from "./DeleteMessageModal";
import { useFirestoreUser } from "../providers/FirestoreUser";

export default function Chat() {
    const { user, db, onSnapshot, addMessage, teamData, collection } = useAuth();
    const { currentTeam, teamUsersDisplayNames } = useFirestoreUser();
    const { slug } = useParams();
    const colorValue = useColorModeValue("gray.200", "whiteAlpha.200");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
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
        if (!currentTeam || !currentTeam.id) return;
        const messagesRef = collection(db, "teams", currentTeam.id, "messages");

        const unsubscribe = onSnapshot(messagesRef, (querySnapshot) => {
            const chatMessages = querySnapshot.docs
                .map((msg) => ({
                    ...msg.data(),
                    id: msg.id,
                }))
                .sort((a, b) => a.createdAt - b.createdAt);
            setMessages(chatMessages);
        });

        return unsubscribe;
    }, [slug, teamData, db, onSnapshot, currentTeam]);

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

    const timeInMilliseconds = (ts) => ts.seconds * 1000 + ts.nanoseconds / 1e6;

    const convertToDate = (ts) => new Date(timeInMilliseconds(ts)).toLocaleString("en-US", dateOptions);

    const convertToTime = (ts) => new Date(timeInMilliseconds(ts)).toLocaleString("en-US", timeOptions);

    const isSameDate = (ts) => {
        const date1 = new Date(timeInMilliseconds(ts));
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
                <Heading size="md">Control panel</Heading>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="10px" paddingBottom="5px">
                <DeleteMessageModal
                    messageID={messageID}
                    isOpen={deleteModalOpen}
                    setIsOpen={setDeleteModalOpen}
                    setHoverID={setHoverID}
                />
                <Stack spacing="3">
                    {messages.map((msg) => (
                        <Stack
                            direction="row"
                            align="center"
                            key={msg.id}
                            spacing="0"
                            paddingLeft="3px"
                            _hover={{ backgroundColor: colorValue, borderRadius: "3px" }}
                            onMouseEnter={() => setHoverID(msg.id)}
                            onMouseLeave={() => setHoverID(null)}
                        >
                            <Avatar name={teamUsersDisplayNames ? teamUsersDisplayNames[msg.uid] : null} size="sm" />
                            <Box flexGrow="1" paddingLeft="6px">
                                <Stack direction="row">
                                    <Text fontSize="xs" fontWeight="bold">
                                        {teamUsersDisplayNames ? teamUsersDisplayNames[msg.uid] : "No name"}
                                    </Text>
                                    <Text fontSize="xs">
                                        {isSameDate(msg.createdAt)
                                            ? convertToTime(msg.createdAt)
                                            : convertToDate(msg.createdAt)}
                                    </Text>
                                </Stack>
                                <Text fontSize="xs">{msg.message}</Text>
                            </Box>
                            {user && user.uid === msg.uid && msg.id === hoverID && (
                                <IconButton
                                    icon={<StyledTrashIcon />}
                                    onClick={() => handleDelete(msg.id)}
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
            </CardBody>
            <CardFooter paddingTop="5px">
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
            </CardFooter>
        </Card>
    );
}
