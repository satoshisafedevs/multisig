import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Card, CardBody, CardFooter, Input, Text, Stack } from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import useAuth from "../hooks/useAuth";
import { useFirestoreUser } from "../providers/FirestoreUser";

export default function Chat() {
    const { firestoreUser } = useFirestoreUser();
    const { db, doc, getDoc, onSnapshot, addMessage } = useAuth();
    const [chatEnabled, setChatEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const watchForChatDocument = async () => {
            if (firestoreUser.team) {
                const docRef = doc(db, "teams", firestoreUser.team);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setChatEnabled(true);
                    onSnapshot(doc(db, "teams", firestoreUser.team, "chat", "messages"), (el) => {
                        const chatMessages = el.data();
                        if (chatMessages) {
                            const sortByTimestamp = Object.fromEntries(
                                Object.entries(chatMessages).sort((a, b) => a[0].localeCompare(b[0])),
                            );
                            setMessages(sortByTimestamp);
                        }
                    });
                }
            }
        };
        const unsubscribe = watchForChatDocument();
        return () => unsubscribe;
    }, [firestoreUser]);

    const handleText = (event) => setMessage(event.target.value);

    const dateOptions = {
        timeZone: "America/Los_Angeles",
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

    return (
        <Card height="100%">
            <CardBody overflow="auto">
                <Text fontSize="lg" fontWeight="bold">
                    Control panel
                </Text>
                {chatEnabled && (
                    <Stack spacing="3" paddingTop="3">
                        {Object.entries(messages).map(([key, value]) => (
                            <Stack direction="row" align="center" key={key} spacing="2">
                                <Avatar name={value.from} size="sm" />
                                <Box>
                                    <Text fontSize="xs">
                                        {value.from} {isSameDate(key) ? convertToTime(key) : convertToDate(key)}
                                    </Text>
                                    <Text fontSize="xs">{value.message}</Text>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </CardBody>
            <CardFooter>
                {chatEnabled && (
                    <>
                        <Input placeholder="Chat or action" value={message} onChange={handleText} />
                        <Box>
                            <Button
                                marginLeft="20px"
                                colorScheme="green300"
                                rightIcon={<IoSend size="20px" />}
                                onClick={() => {
                                    if (message.length !== 0) {
                                        addMessage(message);
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
