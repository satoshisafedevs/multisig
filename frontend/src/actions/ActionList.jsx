import React from "react";
import { Box, Button, Flex, HStack, VStack, Image, Heading } from "@chakra-ui/react";
import PropTypes from "prop-types";

function ActionList({ data }) {
    return (
        <Box>
            {Object.entries(data).map(([key, value]) => (
                <Box key={key} my="5">
                    <VStack align="start" spacing={2.5}>
                        <Flex align="center" height="24px">
                            <Image boxSize="24px" src={value.icon} alt={value.title} />
                            <Heading size="sm" paddingLeft="10px">
                                {value.title}
                            </Heading>
                        </Flex>
                        <HStack spacing="3" flexWrap="wrap">
                            {Object.entries(value.actions).map(([actionKey, actionValue]) => (
                                <Button key={actionKey} size="sm" colorScheme="green300" variant="outline">
                                    {actionValue}
                                </Button>
                            ))}
                        </HStack>
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
