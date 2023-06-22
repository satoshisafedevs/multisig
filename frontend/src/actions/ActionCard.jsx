import React from "react";
import { Button, Card, CardBody, CardFooter, Heading, Input } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import ActionList from "./ActionList";
import actions from "./actions.json";

export default function ActionCard() {
    return (
        <Card height="100%">
            <CardBody>
                <Heading size="md">Actions</Heading>
                <Input marginTop="10px" placeholder="Filter actions" />
                <ActionList data={actions} />
            </CardBody>
            <CardFooter>
                <Button leftIcon={<IoAdd size="25px" />} width="100%" colorScheme="green300">
                    Add protocol function
                </Button>
            </CardFooter>
        </Card>
    );
}
