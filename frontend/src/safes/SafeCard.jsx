import React, { useState } from "react";
import { Flex, Button, Card, Image, Text, CardBody, CardFooter, Heading } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useUser } from "../providers/User";
import { useSafeBalance } from "../providers/SafeBalance";
import networks from "./networks.json";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";

function SafeCard() {
    const { currentTeam } = useUser();
    const { safesPortfolio } = useSafeBalance();
    const [modalOpen, setModalOpen] = useState(false);

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    return (
        <>
            <Card height="100%">
                <CardBody>
                    <Heading size="md" paddingBottom="10px">
                        Safes
                    </Heading>
                    {(currentTeam.safes || []).map((safe) => (
                        <Flex key={safe.safeAddress} align="center" padding="4px 0">
                            <Image boxSize="20px" marginRight="6px" src={networks[safe?.network]?.icon || ""} />
                            <Text fontSize="sm">
                                {safe.safeAddress.slice(0, 5)}
                                ...
                                {safe.safeAddress.slice(-4)}
                                {safesPortfolio && safesPortfolio[safe.safeAddress]
                                    ? ` - ${formatter.format(safesPortfolio[safe.safeAddress].total_usd_value)}`
                                    : null}
                            </Text>
                        </Flex>
                    ))}
                </CardBody>
                <CardFooter>
                    <Button
                        leftIcon={<IoAdd size="25px" />}
                        width="100%"
                        colorScheme="green300"
                        onClick={() => setModalOpen(true)}
                    >
                        Add Satoshi Safe
                    </Button>
                </CardFooter>
            </Card>
            <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
        </>
    );
}

export default SafeCard;
