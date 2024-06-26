import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useToast } from "@chakra-ui/react";
import { useAccount, useBalance, useConnect, useNetwork, useSwitchNetwork } from "wagmi";
import { useUser } from "./User";

const WagmiContext = createContext();
const WagmiProvider = WagmiContext.Provider;

export function useWagmi() {
    return useContext(WagmiContext);
}

function Wagmi({ children }) {
    const toast = useToast();
    const { userTeamData } = useUser();
    const [pagedOpened, setPageOpened] = useState(false);
    const [preflightCheck, setPreflightCheck] = useState(true);
    const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
    const [walletMismatch, setWalletMismatch] = useState(false);
    const { chain } = useNetwork();
    const {
        chains,
        error: switchNetworkError,
        isLoading: switchNetworkIsLoading,
        switchNetwork,
        switchNetworkAsync,
    } = useSwitchNetwork();
    const { connect, error: connectError, isLoading: connectIsLoading, connectors, pendingConnector } = useConnect();
    const { address, connector, isConnected } = useAccount();
    const { data: wallet } = useBalance({ address });

    useEffect(() => {
        const checkMetaMaskInstalled = async () => {
            setMetaMaskInstalled(connectors.find((el) => el.name === "MetaMask").ready);
            setPreflightCheck(false);
        };
        checkMetaMaskInstalled();
        setPageOpened(true);
    }, []);

    useEffect(() => {
        if (connectError) {
            toast({
                description: `Failed to connect: ${connectError?.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [connectError]);

    useEffect(() => {
        if (switchNetworkError) {
            toast({
                description: `Failed to switch network: ${switchNetworkError?.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [switchNetworkError]);

    useEffect(() => {
        if (address && userTeamData?.userWalletAddress) {
            if (address !== userTeamData.userWalletAddress) {
                setWalletMismatch(true);
            } else {
                setWalletMismatch(false);
            }
        }
        if (!address) {
            setWalletMismatch(false);
        }
    }, [address, userTeamData]);

    useEffect(() => {
        if (pagedOpened && address) {
            toast({
                description: "MetaMask account has been updated.",
                position: "top",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [address]);

    const values = useMemo(
        () => ({
            preflightCheck,
            metaMaskInstalled,
            pendingConnector,
            isConnected,
            connectIsLoading,
            address,
            wallet,
            walletMismatch,
            setWalletMismatch,
            connector,
            connectors,
            connect,
            chain,
            chains,
            switchNetwork,
            switchNetworkAsync,
            switchNetworkIsLoading,
        }),
        [
            preflightCheck,
            metaMaskInstalled,
            pendingConnector,
            isConnected,
            connectIsLoading,
            address,
            wallet,
            walletMismatch,
            connector,
            connectors,
            connect,
            chain,
            chains,
            switchNetwork,
            switchNetworkAsync,
            switchNetworkIsLoading,
        ],
    );

    return <WagmiProvider value={values}>{children}</WagmiProvider>;
}

Wagmi.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Wagmi;
