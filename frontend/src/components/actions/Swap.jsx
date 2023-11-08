import React, { useEffect, useState } from "react";
import { Box, Stack } from "@chakra-ui/react";
import { Squid } from "@0xsquid/sdk";
import Swapper from "./Swapper";

export default function Swap() {
    const [squid, setSquid] = useState();
    const [fromSafe, setFromSafe] = useState("");
    const [fromChain, setFromChain] = useState("");
    const [fromToken, setFromToken] = useState({});
    const [fromAmount, setFromAmount] = useState("");
    const [toSafe, setToSafe] = useState("");
    const [toChain, setToChain] = useState("");
    const [toToken, setToToken] = useState({});

    useEffect(() => {
        const getSquidSDK = async () => {
            const squidSDK = new Squid({
                baseUrl: "https://v2.api.squidrouter.com",
                integratorId: "satoshisafe-swap-widget",
            });
            await squidSDK.init();
            setSquid(squidSDK);
        };
        getSquidSDK();
    }, []);

    return (
        <Stack padding="10px 0">
            <Swapper
                squid={squid}
                safe={fromSafe}
                setSafe={setFromSafe}
                chain={fromChain}
                setChain={setFromChain}
                token={fromToken}
                setToken={setFromToken}
                amount={fromAmount}
                setAmount={setFromAmount}
            />
            <Box fontSize="14px">For</Box>
            <Swapper
                squid={squid}
                safe={toSafe}
                setSafe={setToSafe}
                chain={toChain}
                setChain={setToChain}
                token={toToken}
                setToken={setToToken}
                amount=""
                setAmount={() => {}}
                inputDisabled
            />
        </Stack>
    );
}
