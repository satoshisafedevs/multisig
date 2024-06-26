import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Stack,
    // Divider,
    useToast,
} from "@chakra-ui/react";
import { LiFi } from "@lifi/sdk";
import { ethers } from "ethers";
import { upperFirst } from "lodash";
import {
    // IoShuffleOutline,
    // IoArrowDownCircleOutline,
    IoPaperPlane,
} from "react-icons/io5";
import { FaGasPump } from "react-icons/fa6";
import { useWagmi } from "../../providers/Wagmi";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import { formatNumber, fromHumanReadable, toHumanReadable } from "../../utils";
import erc20Abi from "./erc20Abi.json";
// import Swapper from "./Swapper";
import networks from "../../utils/networks.json";
import SwapperOnChain from "./SwapperOnChain";
import GetSwapEstimateButton from "./GetSwapEstimateButton";
// import SelectSwapRouteModal from "./SelectSwapRouteModal";

export default function Swap() {
    const { address, isConnected, chain, metaMaskInstalled, switchNetwork, walletMismatch } = useWagmi();
    const { createAndApproveSwapTransaction } = useGnosisSafe();
    const toast = useToast();
    const [lifi, setLiFi] = useState();
    const [fromSafe, setFromSafe] = useState("");
    const [fromChain, setFromChain] = useState();
    const [fromToken, setFromToken] = useState({});
    const [fromAmount, setFromAmount] = useState("");
    const [fromNetwork, setFromNetwork] = useState("");
    const [fromBalances, setFromBalances] = useState({});
    const [toSafe, setToSafe] = useState("");
    const [toChain, setToChain] = useState();
    const [toToken, setToToken] = useState({});
    const [toNetwork, setToNetwork] = useState("");
    const [loadingRoutes, setLoadingRoutes] = useState(false);
    // const [lifiRoutes, setLifiRoutes] = useState();
    const [routeData, setRouteData] = useState();
    // const [totalUSDFrom, setTotalUSDFrom] = useState();
    // eslint-disable-next-line no-unused-vars
    // const [swapRouteModalOpen, setSwapRouteModalOpen] = useState(false);
    const [loadingTokens, setLoadingTokens] = useState(false);
    const [lifiChainTokens, setLifiChainTokens] = useState([]);
    const [creatingTransaction, setCreatingTransaction] = useState(false);

    const getLiFiSDK = () => {
        const lifiSDK = new LiFi({
            // integrator: 'Your dApp/company name'
        });
        setLiFi(lifiSDK);
    };

    useEffect(() => {
        getLiFiSDK();
    }, []);

    // const routeOptions = {
    //     integrator?: string // Should contain the identifier of the integrator. Usually, it's dApp/company name.
    //     fee?: number // 0.03 = take 3% integrator fee (requires verified integrator to be set)
    //     insurance?: boolean // Whether the user wants to insure their tx
    //     maxPriceImpact?: number // Hide routes with price impact greater than or equal to this value
    //     order?: Order // (default: RECOMMENDED) 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST'
    //     slippage?: number // (default: 0.03) Expressed as decimal proportion, 0.03 represents 3%
    //     referrer?: string // Integrators can set a wallet address as a referrer to track them
    //     infiniteApproval?: boolean // (default: false)
    //     allowSwitchChain?: boolean // (default: false) Whether chain switches should be allowed in the routes
    //     allowDestinationCall?: boolean // (default: true) destination calls are enabled by default
    //     bridges?: AllowDenyPrefer
    //     exchanges?: AllowDenyPrefer
    //   }

    // const routesRequest = {
    //     fromChainId: fromChain, // number
    //     fromAmount: fromAmount && fromToken.decimals && fromHumanReadable(fromAmount, fromToken.decimals), // string
    //     fromTokenAddress: fromToken.address, // string
    //     fromAddress: fromSafe, // string
    //     toChainId: toChain, // number
    //     toTokenAddress: toToken.address, // string
    //     toAddress: toSafe, // string
    //     // options: routeOptions
    // };

    const params = {
        fromChain,
        toChain,
        fromToken: fromToken?.address,
        toToken: toToken.address,
        fromAmount: fromAmount && fromToken?.decimals && fromHumanReadable(fromAmount, fromToken.decimals),
        fromAddress: fromSafe,
        order: "RECOMMENDED",
        // integrator: "???"
    };

    const getLiFiRoutes = async () => {
        try {
            setLoadingRoutes(true);
            setRouteData();
            const response = await fetch(`https://li.quest/v1/quote?${new URLSearchParams(params)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            const respData = await response.json();
            setRouteData(respData);
        } catch (error) {
            toast({
                description: `Failed to get swap quote: ${error?.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingRoutes(false);
        }
    };

    const handleSafe = async (safeConfig) => {
        setLoadingTokens(true);
        setRouteData();
        setFromToken({});
        setToToken({});
        const { safeAddress, network } = safeConfig;
        setFromSafe(safeAddress);
        setToSafe(safeAddress);
        setFromNetwork(network);
        setToNetwork(network);
        const targetChainId = networks[network.toLowerCase()]?.id;
        const lifiTokens = await lifi.getTokens({ chains: [targetChainId] });
        setLifiChainTokens(lifiTokens?.tokens[targetChainId]);
        setFromChain(targetChainId);
        setToChain(targetChainId);
        setLoadingTokens(false);
    };

    // let estimatedSwapFee = 0;

    // if (routeData) {
    //     const { steps } = routeData;

    //     const sumCosts = (costs) =>
    //         costs.reduce(
    //             // eslint-disable-next-line no-confusing-arrow
    //             (acc, cost) =>
    //                 cost.amount ? acc + parseFloat(toHumanReadable(cost.amount, cost.token?.decimals)) : acc,
    //             0,
    //         );
    //     steps.forEach((step) => {
    //         const { estimate } = step;
    //         if (estimate?.feeCosts?.length > 0) {
    //             estimatedSwapFee += sumCosts(estimate.feeCosts);
    //         }

    //         if (estimate?.gasCosts?.length > 0) {
    //             estimatedSwapFee += sumCosts(estimate.gasCosts);
    //         }
    //     });
    // }

    const contractInterface = new ethers.utils.Interface(erc20Abi);

    const approveEncodeData =
        routeData &&
        contractInterface.encodeFunctionData("approve", [
            routeData?.estimate?.approvalAddress,
            routeData?.estimate?.fromAmount,
        ]);

    let gasCosts = 0;

    if (routeData) {
        gasCosts = parseFloat(
            toHumanReadable(
                routeData?.estimate?.gasCosts[0]?.amount,
                routeData?.estimate?.gasCosts[0]?.amount?.token?.decimals,
            ),
        );
    }

    const fromAmountIsGreaterThanTokenBalance = fromBalances && fromAmount > fromBalances[fromToken?.symbol];

    const networkMismatch = chain && Number(fromChain) !== chain.id;

    const satoshiData = {
        type: "swap",
        fromSafe: fromSafe && ethers.utils.getAddress(fromSafe),
        fromNetwork,
        fromAmount: `${fromAmount} ${fromToken?.symbol}`,
        fromTokenContract: fromToken?.address,
        toSafe: toSafe && ethers.utils.getAddress(toSafe),
        toNetwork,
        toAmount: `${
            routeData?.estimate?.toAmount &&
            routeData?.action?.toToken?.decimals &&
            toHumanReadable(routeData.estimate.toAmount, routeData.action.toToken.decimals)
        } ${toToken?.symbol}`,
        toTokenContract: toToken?.address,
    };

    return (
        <>
            {/* <SelectSwapRouteModal
                routes={lifiRoutes?.routes}
                isOpen={swapRouteModalOpen}
                setIsOpen={setSwapRouteModalOpen}
                setRouteData={setRouteData}
                getLiFiRoutes={getLiFiRoutes}
                loadingRoutes={loadingRoutes}
            /> */}
            <Stack padding="20px 0" gap="0">
                <SwapperOnChain
                    lifi={lifi}
                    safe={fromSafe}
                    networkName={fromNetwork}
                    loadingTokens={loadingTokens}
                    handleSafe={handleSafe}
                    lifiChainTokens={lifiChainTokens}
                    fromToken={fromToken}
                    setFromToken={setFromToken}
                    setRouteData={setRouteData}
                    toToken={toToken}
                    setToToken={setToToken}
                    fromAmount={fromAmount}
                    setFromAmount={setFromAmount}
                    toAmount={
                        routeData?.estimate?.toAmount && routeData?.action?.toToken?.decimals
                            ? toHumanReadable(routeData.estimate.toAmount, routeData.action.toToken.decimals)
                            : ""
                    }
                    setFromBalances={setFromBalances}
                />
                {/* <Swapper
                    lifi={lifi}
                    safe={fromSafe}
                    setSafe={setFromSafe}
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
                        style={{ minWidth: "25px", minHeight: "25px", color: "var(--chakra-colors-blueSwatch-500)" }}
                    />
                    <Divider />
                </Box>
                <Swapper
                    lifi={lifi}
                    safe={toSafe}
                    setSafe={setToSafe}
                    setChain={setToChain}
                    token={toToken}
                    setToken={setToToken}
                    amount={
                        routeData?.estimate?.toAmount && routeData?.action?.toToken?.decimals
                            ? toHumanReadable(routeData.estimate.toAmount, routeData.action.toToken.decimals)
                            : ""
                    }
                    setFromNetwork={setToNetwork}
                    totalUSDFrom={totalUSDFrom}
                    setRouteData={setRouteData}
                    destinationSafe
                /> */}
                <GetSwapEstimateButton
                    loadingRoutes={loadingRoutes}
                    getLiFiRoutes={getLiFiRoutes}
                    fromChain={fromChain}
                    fromToken={fromToken}
                    fromAmount={fromAmount}
                    toChain={toChain}
                    toToken={toToken}
                    fromSafe={fromSafe}
                    toSafe={toSafe}
                    routeData={routeData}
                    setRouteData={setRouteData}
                />
                {routeData && (
                    <>
                        <Button
                            marginTop="12px"
                            colorScheme={
                                networkMismatch || fromAmountIsGreaterThanTokenBalance ? "bronzeSwatch" : "blueSwatch"
                            }
                            rightIcon={<IoPaperPlane size="20px" />}
                            onClick={async () => {
                                if (networkMismatch) {
                                    switchNetwork(Number(fromChain));
                                } else {
                                    setCreatingTransaction(true);
                                    await createAndApproveSwapTransaction(
                                        fromNetwork,
                                        fromSafe,
                                        {
                                            to: routeData?.action?.fromToken?.address,
                                            data: approveEncodeData,
                                        },
                                        {
                                            to: routeData?.transactionRequest?.to, // lifi smart contract
                                            data: routeData?.transactionRequest?.data,
                                            value: ethers.BigNumber.from(
                                                routeData?.transactionRequest?.value,
                                            ).toString(),
                                            // converting hexadecimal to BigNumber
                                        },
                                        address,
                                        satoshiData,
                                    );
                                    setCreatingTransaction(false);
                                    setRouteData();
                                }
                            }}
                            isDisabled={
                                !routeData ||
                                !isConnected ||
                                !address ||
                                !metaMaskInstalled ||
                                walletMismatch ||
                                fromAmountIsGreaterThanTokenBalance ||
                                creatingTransaction
                            }
                            isLoading={creatingTransaction}
                            loadingText="Creating transaction..."
                        >
                            {(fromAmountIsGreaterThanTokenBalance &&
                                `Insufficient safe ${fromToken?.symbol} balance`) ||
                                (networkMismatch && `Switch to ${upperFirst(fromNetwork)} network`) ||
                                "Create safe transaction"}
                        </Button>
                        <Box
                            display="flex"
                            alignItems="center"
                            paddingTop="5px"
                            justifyContent="end"
                            color="gray.500"
                            fontSize="small"
                        >
                            <FaGasPump size="16px" style={{ marginRight: "5px" }} /> $
                            {routeData?.estimate?.gasCosts[0]?.amountUSD} ({formatNumber(gasCosts)} ETH)
                        </Box>
                    </>
                )}
            </Stack>
        </>
    );
}
