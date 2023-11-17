import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Divider, useToast } from "@chakra-ui/react";
import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import { IoShuffleOutline, IoArrowDownCircleOutline } from "react-icons/io5";
import Swapper from "./Swapper";

export default function Swap() {
    const toast = useToast();
    const [squid, setSquid] = useState();
    const [fromSafe, setFromSafe] = useState("");
    const [fromChain, setFromChain] = useState("");
    const [fromToken, setFromToken] = useState({});
    const [fromAmount, setFromAmount] = useState("");
    const [toSafe, setToSafe] = useState("");
    const [toChain, setToChain] = useState("");
    const [toToken, setToToken] = useState({});
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeData, setRouteData] = useState();
    const [totalUSDFrom, setTotalUSDFrom] = useState();

    const getSquidSDK = async () => {
        const squidSDK = new Squid({
            baseUrl: "https://v2.api.squidrouter.com",
            integratorId: "satoshisafe-swap-widget",
        });
        await squidSDK.init();
        setSquid(squidSDK);
    };

    // console.log(fromToken);

    useEffect(() => {
        getSquidSDK();
    }, []);

    const fromHumanReadable = (value, decimals) => {
        // Truncate the number to the desired decimal places
        const factor = 10 ** decimals;
        const truncatedValue = Math.floor(value * factor) / factor;
        // Convert a human-readable number to its representation in the smallest unit
        const formattedValue = ethers.utils.parseUnits(truncatedValue.toString(), decimals);
        return formattedValue.toString();
    };

    const toHumanReadable = (value, decimals) => {
        // Use the BigNumber utility from ethers.js
        const bigNumberValue = ethers.BigNumber.from(value);
        // Divide by 10 to the power of decimals to get the human-readable number
        const humanReadable = ethers.utils.formatUnits(bigNumberValue, decimals);
        return humanReadable;
    };

    // const slippage = 1.0;

    const params = {
        fromChain,
        fromToken: fromToken.address,
        fromAmount: fromAmount && fromToken.decimals && fromHumanReadable(fromAmount, fromToken.decimals), // 0.05 WETH
        toChain,
        toToken: toToken.address, // aUSDC on Avalanche Fuji Testnet
        fromAddress: fromSafe, // ethers.signer.address; transaction sender address
        toAddress: toSafe, // the recipient of the trade
        // enableForecall: true, // instant execution service, defaults to true
        enableBoost: true, // Boost (GMP Express) is a special feature of Axelar and Squid
        // that reduces transaction time across chains to 5-30 seconds.
        // It is currently available for swaps below a value of $20,000 USD.
        quoteOnly: false, // optional, defaults to false
        slippage: 1.0, // 1.00 = 1% max slippage across the entire route
        slippageConfig: {
            autoMode: 1, // 1 is "normal" slippage. Always set to 1
        },
        collectFees: {
            integratorAddress: "0x15C3c3E0444bC58aad1c3b27d196016F9E28bC70",
            fee: 50,
        },
    };

    const getSquidRoute = async () => {
        try {
            setRouteData();
            setLoadingRoute(true);
            const { route } = await squid.getRoute(params);
            getSquidSDK();
            setLoadingRoute(false);
            setRouteData(route);
        } catch (error) {
            setLoadingRoute(false);
            toast({
                description: `Failed to get swap data: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Stack padding="10px 0" gap="0">
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
                setRouteData={setRouteData}
                setTotalUSDFrom={setTotalUSDFrom}
            />
            <Box paddingBottom="18px" display="flex" justifyContent="center" alignItems="center">
                <Divider />
                <IoArrowDownCircleOutline
                    style={{ minWidth: "25px", minHeight: "25px", color: "var(--chakra-colors-green300-500)" }}
                />
                <Divider />
            </Box>
            <Swapper
                squid={squid}
                safe={toSafe}
                setSafe={setToSafe}
                chain={toChain}
                setChain={setToChain}
                token={toToken}
                setToken={setToToken}
                amount={
                    routeData?.estimate?.toAmount
                        ? toHumanReadable(routeData.estimate.toAmount, routeData.estimate.toToken.decimals)
                        : ""
                }
                setAmount={() => {}}
                totalUSDFrom={totalUSDFrom}
                setRouteData={setRouteData}
                inputDisabled
            />
            <Button
                marginTop="12px"
                colorScheme="green300"
                rightIcon={<IoShuffleOutline size="25px" />}
                onClick={getSquidRoute}
                isLoading={loadingRoute}
                loadingText="Getting Swap Data..."
                spinnerPlacement="end"
                isDisabled={
                    !fromChain ||
                    !fromToken.address ||
                    !fromAmount ||
                    !toChain ||
                    !toToken.address ||
                    !fromSafe ||
                    !toSafe
                }
            >
                Get Swap Data
            </Button>
            {routeData?.transactionRequest && (
                <pre
                    style={{
                        overflow: "auto",
                        fontSize: "12px",
                    }}
                >
                    {JSON.stringify(routeData.transactionRequest, null, 2)}
                </pre>
            )}
        </Stack>
    );
}
