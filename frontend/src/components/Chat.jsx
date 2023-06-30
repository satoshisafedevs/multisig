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
    useToast,
} from "@chakra-ui/react";
import { IoSend, IoTrash } from "react-icons/io5";
import { db, collection, addDoc, onSnapshot, Timestamp } from "../firebase";
import DeleteMessageModal from "./DeleteMessageModal";
import { useUser } from "../providers/User";

export default function Chat() {
    const toast = useToast();
    const { firestoreUser, teamsData, currentTeam, teamUsersDisplayNames } = useUser();
    const { slug } = useParams();
    const backgroundHover = useColorModeValue("gray.200", "whiteAlpha.200");
    const satoshiColor = useColorModeValue("green300.700", "green300.200");
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
    }, [slug, teamsData, db, onSnapshot, currentTeam]);

    const addMessage = async (text) => {
        try {
            let type = "text";
            if (text.indexOf("@satoshi") > -1) {
                type = "satoshibot";
            }
            const newMessage = {
                message: text,
                uid: firestoreUser.uid,
                type,
                createdAt: Timestamp.now(),
            };
            // Points to the 'messages' subcollection in the team document
            const messagesCollectionRef = collection(db, "teams", currentTeam.id, "messages");
            // Add a new document with 'newMessage' object. Firestore will auto-generate an ID.
            await addDoc(messagesCollectionRef, newMessage);
            const response = await fetch("https://api-onsatoshibotmessagereceived-mojsb2l5zq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teamid: currentTeam.id,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

    const highlightSatoshi = (msg) =>
        msg
            .split(" ")
            .map((word) => {
                if (word === "@satoshi") {
                    return (
                        <Box as="span" color={satoshiColor} key={word}>
                            {word}
                        </Box>
                    );
                }
                return word;
            })
            .reduce((prev, curr, i) => (i === 0 ? [curr] : [prev, " ", curr]), []);

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
                <Stack spacing="2">
                    {messages.map((msg) => (
                        <Stack
                            direction="row"
                            align="center"
                            key={msg.id}
                            spacing="0"
                            paddingLeft="3px"
                            paddingTop="2px"
                            paddingBottom="2px"
                            _hover={{ backgroundColor: backgroundHover, borderRadius: "3px" }}
                            onMouseEnter={() => setHoverID(msg.id)}
                            onMouseLeave={() => setHoverID(null)}
                        >
                            <Avatar name={teamUsersDisplayNames ? teamUsersDisplayNames[msg.uid] : null} size="sm" />
                            <Box flexGrow="1" paddingLeft="6px">
                                <Stack direction="row" spacing="5px">
                                    <Text fontSize="xs" fontWeight="bold">
                                        {teamUsersDisplayNames ? teamUsersDisplayNames[msg.uid] : "No name"}
                                    </Text>
                                    <Text fontSize="xs">{messageTimeFormat(msg.createdAt)}</Text>
                                </Stack>
                                <Text fontSize="xs">
                                    {msg.message.includes("@satoshi") ? highlightSatoshi(msg.message) : msg.message}
                                </Text>
                            </Box>
                            {firestoreUser && firestoreUser.uid === msg.uid && msg.id === hoverID && (
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
