import React from "react";
import { Button, Card, CardBody, CardFooter, Heading } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";

function SafeCard() {
    return (
        <Card height="100%">
            <CardBody>
                <Heading size="md">Safes</Heading>
            </CardBody>
            <CardFooter>
                <Button leftIcon={<IoAdd size="25px" />} width="100%" colorScheme="green300">
                    Add Satoshi Safe
                </Button>
            </CardFooter>
        </Card>
    );
}

export default SafeCard;
