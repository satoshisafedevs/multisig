import React from "react";
import { Box, Button, HStack, VStack, Image, Heading } from "@chakra-ui/react";
import PropTypes from "prop-types";

function ActionList({ data }) {
    return (
        <Box w="250px" h="100%">
            {Object.entries(data).map(([key, value]) => (
                <Box key={key} my="5">
                    <VStack align="start" spacing={3}>
                        <HStack spacing="3">
                            <Image boxSize="24px" src={value.icon} alt={value.title} />
                            <Heading size="sm">{value.title}</Heading>
                        </HStack>
                        {Object.entries(value.actions).map(([actionKey, actionValue]) => (
                            <Button key={actionKey} size="sm" colorScheme="green300" variant="outline">
                                {actionValue}
                            </Button>
                        ))}
                    </VStack>
                </Box>
            ))}
        </Box>
    );
}

ActionList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object.isRequired,
};

export default ActionList;
