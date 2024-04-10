import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Flex,
    Heading,
    List,
    ListIcon,
    ListItem,
    SimpleGrid,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useUser } from "../../providers/User";

function Plans() {
    const { subscriptionTypes, activeSubscriptions, currentTeam, getSubscriptionTypes } = useUser();
    const selectedColor = useColorModeValue("white", "var(--chakra-colors-gray-700)");
    const selectedBG = useColorModeValue("var(--chakra-colors-blueSwatch-200)", "var(--chakra-colors-blueSwatch-100)");
    useEffect(() => {
        getSubscriptionTypes();
    }, []);
    const activeSubscription = currentTeam
        ? (activeSubscriptions || []).find((s) => s.team?.id === currentTeam.id)
        : null;
    return (
        <Box minWidth="500px" padding="10px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Heading mb="10px" size="lg">
                        Plans
                    </Heading>
                    <Text>
                        Explore and manage your subscription options, including plan features, upgrades, or downgrades,
                        and review plan pricing and terms.
                    </Text>
                </Box>
            </Flex>
            <SimpleGrid spacing={subscriptionTypes.length} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
                {subscriptionTypes.map((sub) => (
                    <Card
                        bg={activeSubscription?.subscription?.id === sub.id ? selectedBG : null}
                        color={activeSubscription?.subscription?.id === sub.id ? selectedColor : null}
                    >
                        <CardHeader>
                            <Heading size="md" textAlign="center">
                                {sub.name}
                            </Heading>
                            <br />
                            <Heading size="md" textAlign="center">
                                ${sub.price.toFixed(2)} / month per seat
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <Text textAlign="center">{sub.description}</Text>
                            <VStack textAlign="left" mt="20px">
                                <List spacing={3}>
                                    {sub.features.map((feature) => (
                                        <Tooltip label={feature.description} fontSize="md">
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} colorScheme="blueSwatch" />
                                                {feature.name}
                                            </ListItem>
                                        </Tooltip>
                                    ))}
                                </List>
                                <Button
                                    isDisabled={activeSubscription?.subscription?.id === sub.id}
                                    mt="30px"
                                    cursor="pointer"
                                >
                                    {activeSubscription?.subscription?.id === sub.id
                                        ? `You are on ${sub.name}`
                                        : `Change to ${sub.name}`}
                                </Button>
                            </VStack>
                        </CardBody>
                        <CardFooter />
                    </Card>
                ))}
            </SimpleGrid>
        </Box>
    );
}

export default Plans;
