import React, { useState } from "react";
import { Flex, Button, Box, Image, Text } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useUser } from "../../providers/User";
import { useSafeBalance } from "../../providers/SafeBalance";
import networks from "../../utils/networks.json";
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
            <Box paddingBottom="20px">
                {currentTeam && currentTeam.safes
                    ? currentTeam.safes.map((safe) => (
                          <Flex key={safe.safeAddress} align="center" padding="4px 0">
                              <Image boxSize="20px" marginRight="6px" src={networks[safe?.network]?.icon || ""} />
                              <Text fontSize="sm">
                                  {safe.safeAddress}
                                  {safesPortfolio && safesPortfolio[safe.safeAddress]
                                      ? ` - ${formatter.format(safesPortfolio[safe.safeAddress].total_usd_value)}`
                                      : null}
                              </Text>
                          </Flex>
                      ))
                    : "You have no safes added."}
            </Box>
            <Button
                leftIcon={<IoAdd size="25px" />}
                width="100%"
                colorScheme="green300"
                onClick={() => setModalOpen(true)}
            >
                Add Satoshi Safe
            </Button>
            <AddSatoshiSafeModal isOpen={modalOpen} setIsOpen={setModalOpen} />
        </>
    );
}

export default SafeCard;
