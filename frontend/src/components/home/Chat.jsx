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
import { db, collection, addDoc, onSnapshot, Timestamp } from "../../firebase";
import DeleteMessageModal from "../DeleteMessageModal";
import { useUser } from "../../providers/User";
import { useWagmi } from "../../providers/Wagmi";
import { useTransactions } from "../../providers/Transactions";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import theme from "../../theme";
import Transaction from "../Transaction";

export default function Chat() {
    const toast = useToast();
    const { firestoreUser, teamsData, currentTeam, teamUsersInfo } = useUser();
    const { address, walletMismatch } = useWagmi();
    const { firestoreTransactions } = useTransactions();
    const { slug } = useParams();
    const { getSafeService, confirmTransaction } = useGnosisSafe();
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
    }, [messages, activeTab]);

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

    const approveTransaction = async (network, safeAddress, safeTxHash) => {
        const safeService = await getSafeService(network);
        confirmTransaction(safeService, safeAddress, safeTxHash);
        // const signature = await getSignature(network);
        // console.log(safeService, signature);
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

    // Combine the two arrays, UI is just dying with 500+ transactions
    const combinedArray = [...messages, ...(firestoreTransactions ? firestoreTransactions.slice(-25) : [])];

    // Sort the combined array by date
    combinedArray.sort(
        (a, b) =>
            new Date(a.isoDate || a.executionDate || a.submissionDate) -
            new Date(b.isoDate || b.executionDate || b.submissionDate),
    );

    return (
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
                <DeleteMessageModal
                    messageID={messageID}
                    isOpen={deleteModalOpen}
                    setIsOpen={setDeleteModalOpen}
                    setHoverID={setHoverID}
                />
                <Stack spacing="2">
                    {activeTab === "all" &&
                        combinedArray.map((msg) => {
                            if (msg.safe) {
                                return (
                                    <Transaction
                                        key={msg.id}
                                        address={address}
                                        transaction={msg}
                                        walletMismatch={walletMismatch}
                                        approveTransaction={approveTransaction}
                                    />
                                );
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
                                        onMouseEnter={() => setHoverID(msg.id)}
                                        onMouseLeave={() => setHoverID(null)}
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
                        firestoreTransactions &&
                        firestoreTransactions
                            .slice(-25)
                            // UI is just dying with 500+ transactions
                            .map((transaction) => (
                                <Transaction
                                    key={transaction.id}
                                    address={address}
                                    transaction={transaction}
                                    walletMismatch={walletMismatch}
                                    approveTransaction={approveTransaction}
                                />
                            ))}
                    <Box ref={lastMessage} />
                </Stack>
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
    );
}