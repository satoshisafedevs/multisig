import React, { useEffect } from "react";
import { Card, CardBody, Heading, Input } from "@chakra-ui/react";
import ActionList from "./ActionList";
import actions from "./actions.json";
import { useUser } from "../providers/User";
import { useWagmi } from "../providers/Wagmi";
import useGnosisSafe from "../hooks/useGnosisSafe";

export default function ActionCard() {
    const { userTeamData } = useUser();
    const { address } = useWagmi();
    const { getSafeService, getSafesByOwner } = useGnosisSafe();

    useEffect(() => {
        if (userTeamData?.userSafes && userTeamData?.userWalletAddress && address) {
            const getData = async () => {
                await Promise.all(
                    userTeamData.userSafes.map(async (userSafe) => {
                        const { network } = userSafe;
                        const safeService = await getSafeService(network);
                        const gnosisSafes = await getSafesByOwner(safeService, userTeamData.userWalletAddress);
                        // eslint-disable-next-line no-console
                        console.log(`safes in ${network}:`, gnosisSafes);
                    }),
                );
            };
            getData();
        }
    }, [address]);

    return (
        <Card height="100%">
            <CardBody overflow="auto">
                <Heading size="md">Actions</Heading>
                <Input marginTop="10px" placeholder="Filter actions" />
                <ActionList data={actions} />
            </CardBody>
        </Card>
    );
}
