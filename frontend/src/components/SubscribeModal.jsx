import {
    Box,
    Flex,
    useColorModeValue,
    CardFooter,
    Tooltip,
    ListItem,
    ListIcon,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    List,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { MdCheckCircle } from "react-icons/md";
import { selectSubscriptionForTeam } from "../firebase";
import { useUser } from "../providers/User";
import { useSubscriptions } from "../providers/Subscriptions";

export default function SubscribeModal({ isOpen }) {
    const [loading, setLoading] = useState(null);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const { currentTeam } = useUser();
    const { subscriptionTypes, getSubscriptionTypes } = useSubscriptions();

    const selectedBG = useColorModeValue("var(--chakra-colors-blueSwatch-100)");

    useEffect(() => {
        getSubscriptionTypes();
    }, []);

    useEffect(() => {
        if (subscriptionTypes.length === 1) {
            setSelectedSubscription(subscriptionTypes[0]);
        } else {
            setSelectedSubscription(null);
        }
    }, [subscriptionTypes]);

    const selectSubscriptionType = async () => {
        setLoading(true);
        try {
            await selectSubscriptionForTeam({
                subscriptionId: selectedSubscription.id,
                teamId: currentTeam.id,
            });
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const renderAvailableSubscriptions = () => (
        <Box minWidth="300px" padding="10px">
            <Flex justifyContent="space-between" alignItems="center" mb="20px">
                <Box>
                    <Text>Please select your subscription plan</Text>
                </Box>
            </Flex>
            <SimpleGrid
                spacing={subscriptionTypes.length}
                justifyContent="center"
                // templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
            >
                {subscriptionTypes.map((sub) => (
                    <Card
                        bg={selectedSubscription?.id === sub.id ? selectedBG : null}
                        // color={selectedSubscription?.id === sub.id ? selectedColor : null}
                        key={sub.id}
                    >
                        <CardHeader>
                            <Heading size="md" textAlign="center">
                                {sub.name}
                            </Heading>
                            <br />
                            <Heading size="md" textAlign="center">
                                ${sub.price.toFixed(2)} / {sub.billingType}
                            </Heading>
                        </CardHeader>
                        <CardBody>
                            <Text textAlign="center">{sub.description}</Text>
                            <VStack textAlign="left" mt="20px">
                                <List spacing={3}>
                                    {sub.freeTrialPeriodDays ? (
                                        <ListItem>
                                            <ListIcon as={MdCheckCircle} />
                                            {sub.freeTrialPeriodDays} days free trial
                                        </ListItem>
                                    ) : null}
                                    {sub.features.map((feature) => (
                                        <Tooltip
                                            label={feature.description}
                                            fontSize="md"
                                            key={`${feature.description}`}
                                        >
                                            <ListItem>
                                                <ListIcon as={MdCheckCircle} />
                                                {feature.name}
                                            </ListItem>
                                        </Tooltip>
                                    ))}
                                </List>
                                {subscriptionTypes.length > 1 && (
                                    <Button mt="30px" cursor="pointer" onClick={() => setSelectedSubscription(sub)}>
                                        Choose
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                        <CardFooter />
                    </Card>
                ))}
            </SimpleGrid>
        </Box>
    );

    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent maxW="500px">
                <ModalHeader>Please select your subscription plan</ModalHeader>
                <ModalBody justifyItems="center">{renderAvailableSubscriptions()}</ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        mr={3}
                        onClick={selectSubscriptionType}
                        isLoading={loading}
                        isDisabled={!selectedSubscription}
                    >
                        Start free trial
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
SubscribeModal.propTypes = {
    isOpen: PropTypes.bool,
};
