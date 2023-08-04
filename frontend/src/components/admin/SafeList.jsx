import React from "react";
import { Box, Button, Heading, Image, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

function SafeList({ walletData }) {
    return (
        <Box w="250px" h="100%" bg="gray.200" p="5">
            <Heading size="lg" mb="5">
                Selected
            </Heading>
            {walletData.map((wallet) => (
                <Button
                    key={wallet.address}
                    size="md"
                    leftIcon={<Image boxSize="24px" src={wallet.icon} alt={wallet.title} />}
                    rightIcon={<Text>{wallet.value}</Text>}
                    my="2"
                >
                    {wallet.address}
                </Button>
            ))}
        </Box>
    );
}

SafeList.propTypes = {
    walletData: PropTypes.arrayOf({
        address: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    }).isRequired,
};

export default SafeList;
