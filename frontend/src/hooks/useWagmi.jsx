import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useAccount, useBalance, useConnect, useNetwork, useSwitchNetwork } from "wagmi";
import { useUser } from "../providers/User";

const useWagmi = () => {
    const toast = useToast();
    const { currentTeam } = useUser();
    const [pagedOpened, setPageOpened] = useState(false);
    const [preflightCheck, setPreflightCheck] = useState(true);
    const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
    const [walletMismatch, setWalletMismatch] = useState(false);
    const { chain } = useNetwork();
    const { chains, error: switchNetworkError, isLoading: switchNetworkIsLoading, switchNetwork } = useSwitchNetwork();
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
        if (connectError || switchNetworkError) {
            toast({
                description: connectError?.message || switchNetworkError?.message,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [connectError, switchNetworkError]);

    useEffect(() => {
        if (address && currentTeam?.userWalletAddress) {
            if (address !== currentTeam.userWalletAddress) {
                setWalletMismatch(true);
            } else {
                setWalletMismatch(false);
            }
        }
    }, [address, currentTeam]);

    useEffect(() => {
        if (pagedOpened && address) {
            toast({
                description: "MetaMask account has been changed.",
                position: "top",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [address]);

    return {
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
        switchNetworkIsLoading,
    };
};

export default useWagmi;
