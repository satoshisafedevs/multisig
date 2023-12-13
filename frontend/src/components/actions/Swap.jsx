import React, { useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Button, Stack, Divider, useToast } from "@chakra-ui/react";
import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import { upperFirst } from "lodash";
import { IoShuffleOutline, IoArrowDownCircleOutline, IoPaperPlane } from "react-icons/io5";
import { useWagmi } from "../../providers/Wagmi";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import erc20Abi from "./erc20Abi.json";
import Swapper from "./Swapper";

export default function Swap() {
    const { address, isConnected, chain, metaMaskInstalled } = useWagmi();
    const { createAndApproveSwapTransaction } = useGnosisSafe();
    const toast = useToast();
    const [squid, setSquid] = useState();
    const [fromSafe, setFromSafe] = useState("");
    const [fromChain, setFromChain] = useState("");
    const [fromToken, setFromToken] = useState({});
    const [fromAmount, setFromAmount] = useState("");
    const [fromNetwork, setFromNetwork] = useState("");
    const [fromBalances, setFromBalances] = useState({});
    const [toSafe, setToSafe] = useState("");
    const [toChain, setToChain] = useState("");
    const [toToken, setToToken] = useState({});
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeData, setRouteData] = useState();
    const [totalUSDFrom, setTotalUSDFrom] = useState();

    const getSquidSDK = async () => {
        try {
            const squidSDK = new Squid({
                baseUrl: "https://v2.api.squidrouter.com",
                integratorId: "satoshisafe-swap-widget",
            });
            await squidSDK.init();
            setSquid(squidSDK);
        } catch (error) {
            toast({
                description: `Failed to initiate swap sdk: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

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
            await getSquidSDK(); // get latest prices
            setLoadingRoute(false);
            setRouteData(route);
        } catch (error) {
            setLoadingRoute(false);
            toast({
                description: `Failed to get swap estimate: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    let estimatedSwapFee = 0;

    if (routeData) {
        const { estimate } = routeData;

        const sumCosts = (costs) =>
            costs.reduce((acc, cost) => (cost.amount ? acc + parseFloat(toHumanReadable(cost.amount, 18)) : acc), 0);

        if (estimate.feeCosts && estimate.feeCosts.length > 0) {
            estimatedSwapFee += sumCosts(estimate.feeCosts);
        }

        if (estimate.gasCosts && estimate.gasCosts.length > 0) {
            estimatedSwapFee += sumCosts(estimate.gasCosts);
        }
    }

    const contractInterface = new ethers.utils.Interface(erc20Abi);

    const approveEncodeData =
        routeData &&
        contractInterface.encodeFunctionData("approve", [
            routeData.transactionRequest.target,
            routeData.estimate.fromAmount,
        ]);

    const fromAmoutIsGreaterThanTokenBalance =
        fromBalances && Number(fromAmount) > Number(fromBalances[fromToken.symbol]);

    const insufficientEthBalance = fromBalances && parseFloat(fromBalances.ETH) < estimatedSwapFee;

    const ethOnlySwapInsufficientBalance =
        fromBalances && fromToken.symbol === "ETH" && fromBalances.ETH < parseFloat(fromAmount) + estimatedSwapFee;

    const networkMismatch = chain && Number(fromChain) !== chain.id;

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
                setFromNetwork={setFromNetwork}
                setFromBalances={setFromBalances}
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
                setFromNetwork={() => {}}
                setFromBalances={() => {}}
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
                loadingText="Getting swap estimate..."
                spinnerPlacement="end"
                isDisabled={
                    !fromChain ||
                    !fromToken.address ||
                    !fromAmount ||
                    Number(fromAmount) === 0 ||
                    !toChain ||
                    !toToken.address ||
                    !fromSafe ||
                    !toSafe
                }
            >
                Get swap estimate
            </Button>
            {routeData && (
                <Button
                    marginTop="12px"
                    colorScheme={
                        networkMismatch ||
                        fromAmoutIsGreaterThanTokenBalance ||
                        insufficientEthBalance ||
                        ethOnlySwapInsufficientBalance
                            ? "orange"
                            : "green300"
                    }
                    rightIcon={<IoPaperPlane size="25px" />}
                    onClick={() => {
                        createAndApproveSwapTransaction(
                            fromNetwork,
                            fromSafe,
                            {
                                to: fromToken.address,
                                data: approveEncodeData,
                            },
                            {
                                to: routeData.transactionRequest.target,
                                data: routeData.transactionRequest.data,
                                value: routeData.transactionRequest.value,
                            },
                            address,
                        );
                    }}
                    isDisabled={
                        !routeData ||
                        !isConnected ||
                        networkMismatch ||
                        !metaMaskInstalled ||
                        fromAmoutIsGreaterThanTokenBalance ||
                        insufficientEthBalance ||
                        ethOnlySwapInsufficientBalance
                    }
                    spinnerPlacement="end"
                >
                    {(networkMismatch && `Switch to ${upperFirst(fromNetwork)} network`) ||
                        (fromAmoutIsGreaterThanTokenBalance && `Insufficient safe ${fromToken.symbol} balance`) ||
                        ((insufficientEthBalance || ethOnlySwapInsufficientBalance) &&
                            "Insufficient safe ETH balance") ||
                        "Create and sign safe transaction"}
                </Button>
            )}
            {routeData && (insufficientEthBalance || ethOnlySwapInsufficientBalance) && (
                <>
                    <Alert status="warning" variant="left-accent" marginTop="5px" borderRadius="base">
                        <AlertIcon />
                        To cover estimated transaction fees, ensure you have at least {estimatedSwapFee}&nbsp;ETH, in
                        addition to the transfer amount, in your safe balance before initiating a transaction.
                    </Alert>
                    <Alert status="info" variant="left-accent" marginTop="5px" borderRadius="base">
                        <AlertIcon />
                        Gas refunds - in order to maximise success rates, smart contracts take a deposit to cover gas
                        costs during the transaction. Once the transaction has completed, the amount left unused is
                        refunded to the safe automatically on the source chain, in the source chain&lsquo;s native gas
                        token.
                    </Alert>
                </>
            )}
            {/* {routeData && !(insufficientEthBalance || ethOnlySwapInsufficientBalance) && (
                <Alert status="info" variant="left-accent" marginTop="5px" borderRadius="base">
                    <AlertIcon />
                    Estimated fees - {estimatedSwapFee}&nbsp;ETH. Gas refunds - in order to maximise success rates,
                    smart contracts take a deposit to cover gas costs during the transaction. Once the transaction has
                    completed, the amount left unused is refunded to the safe automatically on the source chain, in the
                    source chain&lsquo;s native gas token.
                </Alert>
            )} */}
        </Stack>
    );
}
