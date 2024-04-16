import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@chakra-ui/react";
import { IoShuffleOutline } from "react-icons/io5";

function GetSwapEstimateButton({
    loadingRoutes,
    getLiFiRoutes,
    fromChain,
    fromToken,
    fromAmount,
    toChain,
    toToken,
    fromSafe,
    toSafe,
    routeData,
    setRouteData,
}) {
    const [countdown, setCountdown] = useState(60);
    const [countdownMessage, setCountdownMessage] = useState("");

    useEffect(() => {
        let timerId;
        // Start the countdown only if routeData is present
        if (routeData && countdown > 0) {
            setCountdownMessage(`Swap estimate is valid for ${countdown} seconds`); // Set initial countdown message
            timerId = setTimeout(() => {
                setCountdown(countdown - 1); // Decrement countdown
            }, 1000);
        } else if (countdown <= 0) {
            // Once countdown reaches 0, call setRouteData
            setRouteData();
            setCountdownMessage("Get swap estimate");
            setCountdown(60);
        }
        // Cleanup the timeout on component unmount or when countdown changes
        return () => clearTimeout(timerId);
    }, [routeData, countdown]);

    return (
        <Button
            marginTop="12px"
            colorScheme="blueSwatch"
            rightIcon={<IoShuffleOutline size="25px" />}
            onClick={async () => {
                await getLiFiRoutes();
                setCountdown(60);
            }}
            isLoading={loadingRoutes}
            loadingText="Getting swap estimate..."
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
            {(routeData && countdownMessage) || "Get swap estimate"}
        </Button>
    );
}

GetSwapEstimateButton.propTypes = {
    loadingRoutes: PropTypes.bool,
    getLiFiRoutes: PropTypes.func,
    fromChain: PropTypes.number,
    fromToken: PropTypes.shape({
        address: PropTypes.string,
    }),
    fromAmount: PropTypes.string,
    toChain: PropTypes.number,
    toToken: PropTypes.shape({
        address: PropTypes.string,
    }),
    fromSafe: PropTypes.string,
    toSafe: PropTypes.string,
    routeData: PropTypes.shape({}),
    setRouteData: PropTypes.func,
};

export default GetSwapEstimateButton;
