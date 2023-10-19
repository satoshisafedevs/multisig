import React, { useState, useEffect } from "react";
import { Input, Image, Center, Button, useToast } from "@chakra-ui/react";
import wclogo from "../../img/walletconnect_logo.png";
import useWalletConnect from "../../hooks/useWalletConnect";

export default function WalletConnect() {
    const { pair, createWeb3Wallet, ConnectionModal } = useWalletConnect();
    const toast = useToast();
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        createWeb3Wallet();
    }, []);

    const handlePair = async () => {
        try {
            await pair({ uri: inputValue });
        } catch (error) {
            toast({
                description: `WalletConnect Pairing Error: ${error.message}`,
                position: "top",
                status: "error",
                isClosable: true,
            });
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <Center flexDirection="column" p={4}>
            <Image src={wclogo} alt="WalletConnect Logo" mb={4} width="300px" mt="20%" />
            <Input
                value={inputValue}
                onChange={handleChange}
                placeholder="Enter WalletConnect URI"
                size="md"
                w="300px"
                mt="10%"
            />
            <Button
                colorScheme="blue"
                onClick={handlePair}
                mt={4}
                disabled={!inputValue} // disable button if input is empty
            >
                Connect
            </Button>
            {ConnectionModal}
        </Center>
    );
}
