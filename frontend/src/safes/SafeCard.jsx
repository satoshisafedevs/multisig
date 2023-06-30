import React, { useState, useEffect } from "react";
import { Flex, Button, Card, Image, Text, CardBody, CardFooter, Heading } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { ethers } from "ethers";
import { useUser } from "../providers/User";
import networks from "./networks.json";
import AddSatoshiSafeModal from "./AddSatoshiSafeModal";

function SafeCard() {
    const { currentTeam } = useUser();
    const [balances, setBalances] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
            );
            const data = await response.json();
            setPrice(data.ethereum.usd);
        };

        fetchPrice();
    }, []);

    useEffect(() => {
        const fetchBalances = async () => {
            const balancePromises = currentTeam.safes.map(async (safe) => {
                const provider = new ethers.JsonRpcProvider(networks[safe.network].url);
                const address = safe.safeAddress;
                const balanceValue = await provider.getBalance(address);
                return { [address]: ethers.formatUnits(balanceValue) };
            });
            const balanceObjects = await Promise.all(balancePromises);
            const newBalances = Object.assign({}, ...balanceObjects);
            setBalances(newBalances);
        };
        if (currentTeam?.safes) {
            fetchBalances();
        }
    }, [currentTeam]);

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
                            <Image boxSize="20px" marginRight="10px" src={networks[safe?.network]?.icon || ""} />
                            <Text fontSize="sm">
                                {safe.safeAddress.slice(0, 5)}
                                ...
                                {safe.safeAddress.slice(-4)}
                                {balances[safe.safeAddress]
                                    ? ` - ${formatter.format(balances[safe.safeAddress] * price)}`
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
