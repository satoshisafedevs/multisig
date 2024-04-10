import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Input,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSubscriptions } from "../../providers/Subscriptions";
import { isValidEmail } from "../../utils";

function Billing() {
    const { activeSubscriptions, getUserInvoiceSettings, updateUserInvoiceSettings, userInvoiceSettings } =
        useSubscriptions();
    const [isEditing, setIsEditing] = useState({ invoiceEmail: false });
    const [invoiceEmail, setInvoiceEmail] = useState("");
    const [invoiceTaxId, setInvoiceTaxId] = useState("");
    const [invoiceAdditionalInfo, setInvoiceAdditionalInfo] = useState("");
    const toast = useToast();
    // Load user profile information from Firebase
    useEffect(() => {
        getUserInvoiceSettings();
    }, []);

    useEffect(() => {
        if (userInvoiceSettings) {
            setInvoiceEmail(userInvoiceSettings.invoiceEmail || "");
            setInvoiceTaxId(userInvoiceSettings.invoiceTaxId || "");
            setInvoiceAdditionalInfo(userInvoiceSettings.invoiceAdditionalInfo || "");
        }
    }, [userInvoiceSettings]);

    const toggleEditing = (field) => {
        setIsEditing({ ...isEditing, [field]: !isEditing[field] });
    };

    const save = async (field, value) => {
        if (!isEditing[field]) {
            toggleEditing(field);
        } else {
            if (field === "invoiceEmail" && !isValidEmail(value)) {
                toast({
                    description: "Please enter valid email",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            updateUserInvoiceSettings({ [field]: value });
            toggleEditing(field);
        }
    };

    return (
        <Box minWidth="500px" padding="10px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Billing
                    </Heading>
                    <Text>
                        Manage your billing details, including payment methods, subscription plans, and transaction
                        history.
                    </Text>
                </Box>
            </Flex>

            <Box minWidth="500px">
                <Heading mb="10px" size="md">
                    Active subscriptions
                </Heading>
                <Table mb="20px">
                    <Thead>
                        <Tr>
                            <Th>Team</Th>
                            <Th>Subscription plan</Th>
                            <Th>Price</Th>
                            <Th>Next billing day</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {(activeSubscriptions || []).map((sub) => (
                            <Tr key={sub.id}>
                                <Td>{sub.team?.name}</Td>
                                <Td>{sub.subscription?.name}</Td>
                                <Td>${String(sub.subscription?.price?.toFixed(2)).toLocaleString()} / month + tax</Td>
                                <Td>{moment(sub.nextBillingDate).format("YYYY-MM-DD")}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <Text />
            </Box>

            <Box minWidth="500px">
                <Heading mb="10px" size="md">
                    Invoice settings
                </Heading>
                <Divider my={4} />
                <Flex alignItems="center">
                    <Text fontWeight="bold">Billing email</Text>
                    {isEditing.invoiceEmail ? (
                        <Input
                            flex="1"
                            ml="50px"
                            textAlign="right"
                            value={invoiceEmail}
                            onChange={(e) => setInvoiceEmail(e.target.value)}
                        />
                    ) : (
                        <Text textAlign="right" mr="20px" flex="1">
                            {invoiceEmail}
                        </Text>
                    )}
                    <Button onClick={() => save("invoiceEmail", invoiceEmail)}>
                        {isEditing.invoiceEmail ? "Save" : "Edit"}
                    </Button>
                </Flex>
                <Text fontSize="xs">Invoices and receipts will be sent to this email address</Text>
                <Divider my={4} />
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold">Tax ID</Text>
                    {isEditing.invoiceTaxId ? (
                        <Input
                            flex="1"
                            ml="50px"
                            textAlign="right"
                            value={invoiceTaxId}
                            onChange={(e) => setInvoiceTaxId(e.target.value)}
                        />
                    ) : (
                        <Text textAlign="right" mr="20px" flex="1">
                            {invoiceTaxId}
                        </Text>
                    )}
                    <Button onClick={() => save("invoiceTaxId", invoiceTaxId)}>
                        {isEditing.invoiceTaxId ? "Save" : "Edit"}
                    </Button>
                </Flex>
                <Text fontSize="xs">Please enter your tax ID that will be added to the invoice.</Text>
                <Divider my={4} />
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold">Company billing profile</Text>
                    {isEditing.invoiceAdditionalInfo ? (
                        <Textarea
                            flex="1"
                            ml="50px"
                            textAlign="right"
                            value={invoiceAdditionalInfo}
                            onChange={(e) => setInvoiceAdditionalInfo(e.target.value)}
                        />
                    ) : (
                        <Text textAlign="right" mr="20px" flex="1">
                            {invoiceAdditionalInfo}
                        </Text>
                    )}
                    <Button onClick={() => save("invoiceAdditionalInfo", invoiceAdditionalInfo)}>
                        {isEditing.invoiceAdditionalInfo ? "Save" : "Edit"}
                    </Button>
                </Flex>
                <Text fontSize="xs">
                    Additional company information to be shown on invoices; e.g. address, PO number, etc.
                </Text>
            </Box>

            <Divider mb="20px" />
            <Box minWidth="500px">
                <Heading mb="10px" size="md">
                    All invoices
                </Heading>
                <Table mb="20px">
                    <Thead>
                        <Tr>
                            <Th>Invoice date</Th>
                            <Th>Invoice detail</Th>
                            <Th>Total charged</Th>
                            <Th>Invoice</Th>
                        </Tr>
                    </Thead>
                    <Tbody />
                </Table>
                <Text />
            </Box>
        </Box>
    );
}

export default Billing;
