import { Box, Divider, Flex, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Link } from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import { useSubscriptions } from "../../providers/Subscriptions";

function Billing() {
    const { activeSubscriptions, userInvoices } = useSubscriptions();

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

            <Divider mb="20px" />
            <Box minWidth="500px">
                <Heading mb="10px" size="md">
                    All invoices
                </Heading>
                <Table mb="20px">
                    <Thead>
                        <Tr>
                            <Th>Invoice date</Th>
                            <Th>Invoice status</Th>
                            <Th>Invoice email</Th>
                            <Th>Invoice name</Th>
                            <Th>Invoice detail</Th>
                            <Th>Total charged</Th>
                            <Th>URL</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {(userInvoices || []).map((invoice) => (
                            <Tr key={invoice.id}>
                                <Td>
                                    <Text>{moment(invoice.paidAt.toDate()).format("YYYY-MM-DD HH:mm")}</Text>
                                </Td>
                                <Td>{invoice.status.toUpperCase()}</Td>
                                <Td>{invoice.customerEmail}</Td>
                                <Td>{invoice.customerName}</Td>
                                <Td>Subscription payment</Td>
                                <Td>
                                    {String((invoice.amountPaid / 100).toFixed(2)).toLocaleString()}{" "}
                                    {invoice.currency.toUpperCase()}
                                </Td>
                                <Td>
                                    <Link href={invoice.invoiceUrl}>Download invoice</Link>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <Text />
            </Box>
        </Box>
    );
}

export default Billing;
