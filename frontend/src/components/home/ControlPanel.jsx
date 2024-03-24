import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Input,
    Stack,
    Heading,
    Menu,
    MenuButton,
    MenuList,
    MenuItemOption,
    MenuOptionGroup,
    useToast,
} from "@chakra-ui/react";
import { IoSend, IoFilterOutline } from "react-icons/io5";
import { db, collection, addDoc, onSnapshot, Timestamp } from "../../firebase";
import { useUser } from "../../providers/User";
import { useTransactions } from "../../providers/Transactions";
import { convertToISOString } from "../../utils";
import Transaction from "../Transaction";
import InFlightTransaction from "../InFlightTransaction";
import Message from "../Message";

export default function Chat() {
    const toast = useToast();
    const { firestoreUser, teamsData, currentTeam } = useUser();
    const { firestoreTransactions, loadMoreTransactions, isTransactionsLoading, setFilteredSafes } = useTransactions();
    const { slug } = useParams();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [hoverID, setHoverID] = useState();
    const [filter, setFilter] = useState(["all"]);
    const lastMessage = useRef();
    const loadingMoreTransactions = useRef(false);

    useEffect(() => {
        if (messages && lastMessage.current && !loadingMoreTransactions.current) {
            lastMessage.current.scrollIntoView();
        }
        loadingMoreTransactions.current = false;
    }, [messages, firestoreTransactions]);

    useEffect(() => {
        if (filter.includes("all")) {
            setFilteredSafes([]);
        } else {
            const removeMessages = filter.filter((item) => item !== "messages");
            if (removeMessages.length > 0) {
                setFilteredSafes(removeMessages);
            }
        }
    }, [filter]);

    const handleLoadMoreTransactions = () => {
        loadingMoreTransactions.current = true;
        loadMoreTransactions();
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

    const filterSameNonceTransactions = useMemo(() => {
        const results = [];

        // If there are no transactions, we don't need to do any work
        if (!firestoreTransactions) {
            return results;
        }

        // Group transactions by 'safe'
        const groupedBySafe = firestoreTransactions.reduce((acc, transaction) => {
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
    }, [firestoreTransactions]);

    // Combine the two arrays
    const combinedArray = useMemo(() => {
        const tempArray = [...messages, ...(filterSameNonceTransactions || [])];
        return tempArray.sort((a, b) => new Date(a.isoDate || a.unifiedDate) - new Date(b.isoDate || b.unifiedDate));
    }, [messages, filterSameNonceTransactions]);

    const handleFilterChange = (value) => {
        if (value === "all") {
            setFilter(["all"]);
        } else if (filter.includes(value)) {
            // After removing value, check if the result is an empty array
            const updatedFilter = filter.filter((item) => item !== value);
            if (updatedFilter.length === 0) {
                setFilter(["all"]);
            } else {
                setFilter(updatedFilter);
            }
        } else {
            setFilter((prevState) => {
                // Check if 'all' is in the current state, remove it if present
                const newState = prevState.includes("all") ? prevState.filter((item) => item !== "all") : prevState;
                // Add the new value to the array
                return [...newState, value];
            });
        }
    };

    const getFilteredData = () => {
        if (filter.includes("all")) {
            return combinedArray;
        }
        if (filter.length === 1 && filter.includes("messages")) {
            return messages;
        }
        if (!filter.includes("messages")) {
            return combinedArray.filter((el) => filter.includes(el.safe) || el.id === "loadMore");
        }
        return combinedArray.filter((el) => filter.includes(el.safe) || el.id === "loadMore" || el.uid);
    };

    return (
        <Card height="100%">
            <CardHeader paddingBottom="3px">
                <Stack display="flex" direction="row" align="baseline">
                    <Heading size="md">Control Panel</Heading>
                    {currentTeam?.safes && (
                        <Menu closeOnSelect={false}>
                            <MenuButton
                                as={Button}
                                size="sm"
                                variant="ghost"
                                fontWeight="normal"
                                rightIcon={<IoFilterOutline />}
                            >
                                Filter
                            </MenuButton>
                            <MenuList>
                                <MenuOptionGroup value={filter} type="checkbox">
                                    <MenuItemOption
                                        value="all"
                                        isChecked={false}
                                        isDisabled={isTransactionsLoading}
                                        onClick={() => handleFilterChange("all")}
                                    >
                                        All
                                    </MenuItemOption>
                                    <MenuItemOption
                                        value="messages"
                                        isDisabled={isTransactionsLoading}
                                        onClick={() => handleFilterChange("messages")}
                                    >
                                        Messages
                                    </MenuItemOption>
                                    {currentTeam?.safes.map((safe) => (
                                        <MenuItemOption
                                            key={safe.safeAddress}
                                            value={safe.safeAddress}
                                            isDisabled={isTransactionsLoading}
                                            onClick={() => handleFilterChange(safe.safeAddress)}
                                        >
                                            Safe: {safe.safeAddress.slice(0, 5)}
                                            ...
                                            {safe.safeAddress.slice(-4)}
                                        </MenuItemOption>
                                    ))}
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>
                    )}
                </Stack>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="10px" paddingBottom="5px">
                <Stack spacing="2">
                    {getFilteredData().map((el) => {
                        if (el.id === "loadMore") {
                            return (
                                <Button
                                    size="sm"
                                    key="loadMore"
                                    onClick={handleLoadMoreTransactions}
                                    isLoading={isTransactionsLoading}
                                    borderRadius="5px"
                                    fontWeight="normal"
                                    colorScheme="blueSwatch"
                                >
                                    Load more transactions
                                </Button>
                            );
                        }
                        if (el.txHash || el.transactionHash || el.nonce || el.data) {
                            return <Transaction key={el.id} transaction={el} />;
                        }
                        if (el.uid) {
                            return <Message key={el.id} message={el} hoverID={hoverID} setHoverID={setHoverID} />;
                        }
                        return <InFlightTransaction key={el.id} transaction={el} />;
                    })}
                </Stack>
                <Box ref={lastMessage} />
            </CardBody>
            <CardFooter paddingTop="5px">
                <Input
                    placeholder="Write a message..."
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
                        colorScheme="blueSwatch"
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
