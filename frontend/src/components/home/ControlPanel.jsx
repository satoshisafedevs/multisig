import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
import { db, collection, addDoc, onSnapshot, Timestamp } from "../../firebase";
import DeleteMessageModal from "../DeleteMessageModal";
import { useUser } from "../../providers/User";
import { useTransactions } from "../../providers/Transactions";
import theme from "../../theme";
import Transaction from "../Transaction";
// import InFlightTransaction from "../InFlightTransaction";

export default function Chat() {
    const toast = useToast();
    const { firestoreUser, teamsData, currentTeam, teamUsersInfo } = useUser();
    const { firestoreTransactions } = useTransactions();
    const { slug } = useParams();
    const backgroundHover = useColorModeValue("gray.100", "whiteAlpha.200");
    const satoshiColor = useColorModeValue(theme.colors.green300[700], theme.colors.green300[200]);
    // chakra ui themeing not working on html tags
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [messageID, setMessageID] = useState();
    const [hoverID, setHoverID] = useState();
    const [activeTab, setActiveTab] = useState("all");
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
    }, [messages, activeTab, firestoreTransactions]);

    const handleMouseEnter = useCallback(
        (id) => {
            setHoverID(id);
        },
        [setHoverID],
    );

    const handleMouseLeave = useCallback(() => {
        setHoverID(null);
    }, [setHoverID]);

    const convertToISOString = (timestamp) => {
        // Convert seconds to milliseconds since JavaScript Date object uses milliseconds
        const date = new Date(timestamp.seconds * 1000);

        // Adjust for nanoseconds
        // In JavaScript, there's no direct nanosecond support. So we'll convert nanoseconds to milliseconds first
        // and adjust the date accordingly. This might not always be super precise because of JavaScript's
        // limitation but for the given format, it should work well.
        const millisecondsFromNanoseconds = timestamp.nanoseconds / 1000000;
        date.setMilliseconds(date.getMilliseconds() + millisecondsFromNanoseconds);

        return date.toISOString();
    };

    useEffect(() => {
        if (!currentTeam || !currentTeam.id) return;
        const messagesRef = collection(db, "teams", currentTeam.id, "messages");

        const unsubscribe = onSnapshot(messagesRef, (querySnapshot) => {
            const chatMessages = querySnapshot.docs
                .map((msg) => ({
                    ...msg.data(),
                    id: msg.id,
                    isoDate: convertToISOString(msg.data().createdAt),
                }))
                .sort((a, b) => a.createdAt - b.createdAt);
            setMessages(chatMessages);
        });

        return unsubscribe;
    }, [slug, teamsData, currentTeam]);

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
            if (type === "satoshibot") {
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
                } else {
                    const json = await response.json();
                    // eslint-disable-next-line no-console
                    console.log(json);
                }
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

    // once the safe is removed filter it's transactions,
    // we need some logic that removes those transactions from backend
    const filterRemovedSafesTransactions = useMemo(() => {
        if (!firestoreTransactions || !currentTeam?.safes) {
            return [];
        }
        return firestoreTransactions.filter(
            (item1) => currentTeam.safes.some((item2) => item1.safe === item2.safeAddress),
            // eslint-disable-next-line function-paren-newline
        );
    }, [firestoreTransactions, currentTeam]);

    // display latest 100 transactions
    const maxTransactions = -100;

    const sortTransactionsByDateAndSlice = useMemo(
        () =>
            filterRemovedSafesTransactions
                .sort(
                    (a, b) =>
                        new Date(a.executionDate || a.submissionDate) - new Date(b.executionDate || b.submissionDate),
                )
                .slice(maxTransactions),
        [filterRemovedSafesTransactions],
    );

    const filterSameNonceTransactions = useMemo(() => {
        const results = [];

        // If there are no transactions, we don't need to do any work
        if (!sortTransactionsByDateAndSlice) {
            return results;
        }

        // Group transactions by 'safe'
        const groupedBySafe = sortTransactionsByDateAndSlice.reduce((acc, transaction) => {
            if (!acc[transaction.safe]) acc[transaction.safe] = [];
            acc[transaction.safe].push(transaction);
            return acc;
        }, {});

        Object.keys(groupedBySafe).forEach((safe) => {
            const safeTransactions = groupedBySafe[safe];
            const executedNonces = new Set();

            // Identify nonces which have isExecuted as true
            safeTransactions.forEach((transaction) => {
                if (transaction.isExecuted && "nonce" in transaction) {
                    executedNonces.add(transaction.nonce);
                }
            });

            // Filter out those transactions
            safeTransactions.forEach((transaction) => {
                if (!("nonce" in transaction) || !executedNonces.has(transaction.nonce) || transaction.isExecuted) {
                    results.push(transaction);
                }
            });
        });
        return results;
    }, [sortTransactionsByDateAndSlice]);

    // Combine the two arrays
    const combinedArray = useMemo(() => {
        const tempArray = [...messages, ...(filterSameNonceTransactions || [])];
        return tempArray.sort(
            (a, b) =>
                new Date(a.isoDate || a.executionDate || a.submissionDate) -
                new Date(b.isoDate || b.executionDate || b.submissionDate),
        );
    }, [messages, filterSameNonceTransactions]);

    return (
        <>
            <DeleteMessageModal
                messageID={messageID}
                isOpen={deleteModalOpen}
                setIsOpen={setDeleteModalOpen}
                setHoverID={setHoverID}
            />
            <Card height="100%">
                <CardHeader paddingBottom="3px">
                    <Stack spacing="24px" display="flex" direction="row" align="baseline">
                        <Heading size="md">Control Panel</Heading>
                        <Button
                            variant="link"
                            size="xs"
                            fontWeight={activeTab === "all" && "bold"}
                            minWidth="24px"
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant="link"
                            size="xs"
                            fontWeight={activeTab === "transactions" && "bold"}
                            minWidth="79px"
                            onClick={() => setActiveTab("transactions")}
                        >
                            Transactions
                        </Button>
                    </Stack>
                </CardHeader>
                <CardBody overflow="auto" paddingTop="10px" paddingBottom="5px">
                    <Stack spacing="2">
                        {activeTab === "all" &&
                            combinedArray &&
                            combinedArray.map((msg) => {
                                if (msg.safe) {
                                    return <Transaction key={msg.id} transaction={msg} />;
                                }
                                if (msg.uid) {
                                    return (
                                        <Stack
                                            direction="row"
                                            align="center"
                                            key={msg.id}
                                            spacing="0"
                                            paddingLeft="3px"
                                            paddingTop="2px"
                                            paddingBottom="2px"
                                            _hover={{ backgroundColor: backgroundHover, borderRadius: "3px" }}
                                            onMouseEnter={() => handleMouseEnter(msg.id)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Avatar
                                                size="sm"
                                                alt={teamUsersInfo ? teamUsersInfo[msg.uid].displayName : null}
                                                src={teamUsersInfo ? teamUsersInfo[msg.uid].photoUrl : null}
                                                name={teamUsersInfo ? teamUsersInfo[msg.uid].displayName : null}
                                            />
                                            <Box flexGrow="1" paddingLeft="6px">
                                                <Stack direction="row" spacing="5px">
                                                    <Text fontSize="xs" fontWeight="bold">
                                                        {teamUsersInfo ? teamUsersInfo[msg.uid].displayName : "No name"}
                                                    </Text>
                                                    <Text fontSize="xs">{messageTimeFormat(msg.createdAt)}</Text>
                                                </Stack>
                                                <Text fontSize="xs">{renderMessage(msg)}</Text>
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
                                        </Stack>
                                    );
                                }
                                return null;
                            })}
                        {activeTab === "transactions" &&
                            filterSameNonceTransactions &&
                            filterSameNonceTransactions.map((transaction) => (
                                <Transaction key={transaction.id} transaction={transaction} />
                            ))}
                        {/* <InFlightTransaction
                            transaction={{
                                network: "mainnet",
                                safe: "1234567890",
                                txHash: "aslkdjhasldkjhsalk",
                                satoshiData: { action: "Send", receiver: "0x", amount: 555 },
                            }}
                        /> */}
                    </Stack>
                    <Box ref={lastMessage} />
                </CardBody>
                <CardFooter paddingTop="5px">
                    <Input
                        placeholder="Chat or action"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
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
        </>
    );
}
