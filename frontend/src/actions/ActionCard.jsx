import React from "react";
import { Card, CardHeader, CardBody, Heading, Input } from "@chakra-ui/react";
import ActionList from "./ActionList";
import actions from "./actions.json";

export default function ActionCard() {
    return (
        <Card height="100%">
            <CardHeader paddingBottom="0">
                <Heading size="md">Actions</Heading>
            </CardHeader>
            <CardBody overflow="auto" paddingTop="0" paddingBottom="0">
                <Input marginTop="10px" placeholder="Filter actions" />
                <ActionList data={actions} />
            </CardBody>
        </Card>
    );
}
