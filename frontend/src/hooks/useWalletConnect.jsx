import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
// eslint-disable-next-line import/no-extraneous-dependencies
import { buildApprovedNamespaces } from "@walletconnect/utils";
import { useDisclosure, useToast } from "@chakra-ui/react";
import WCModal from "../components/actions/WCModal";
import { useUser } from "../providers/User";
import useGnosisSafe from "./useGnosisSafe";
import { NETWORK_EIP, EIP155_SIGNING_METHODS } from "../utils/networkeip";
import checkNetwork from "../utils/checkNetwork";

const useWalletConnect = () => {
    // Initialize WalletConnect
    const [web3wallet, setWeb3Wallet] = useState(null);
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [transactionRequest, setTransactionRequest] = useState(null);
    const [sessionProposal, setSessionProposal] = useState(null);
    const [modalType, setModalType] = useState("transaction");
    const [pairings, setPairings] = useState([]);
    const [sessions, setSessions] = useState(null);
    const { currentTeam, userTeamData } = useUser();
    const { createAndApproveTransaction, loadSafe } = useGnosisSafe();
    const toast = useToast();
    let { safes } = currentTeam;
    let uniqueNetworks = [...new Set(safes.map(({ network }) => network))];
    let chains = uniqueNetworks.map((network) => NETWORK_EIP[network]).filter((chainId) => chainId !== undefined);

    const accounts = safes
        .map(({ network, safeAddress }) => {
            const chainId = NETWORK_EIP[network];
            return chainId ? `${chainId}:${safeAddress}` : null;
        })
        .filter((account) => account !== null);

    useEffect(() => {
        if (web3wallet) {
            setPairings(web3wallet.core.pairing.getPairings());
            setSessions(web3wallet.getActiveSessions());
        }
    }, [web3wallet]);

    useEffect(() => {
        if (currentTeam) {
            safes = currentTeam.safes;
            uniqueNetworks = [...new Set(safes.map(({ network }) => network))];
            chains = uniqueNetworks.map((network) => NETWORK_EIP[network]).filter((chainId) => chainId !== undefined);
        }
    }, [currentTeam]);

    const handleApproveConnection = async () => {
        if (sessionProposal) {
            // Logic to approve the session...
            // Extract unique networks from data
            try {
                const approvedNamespaces = buildApprovedNamespaces({
                    proposal: sessionProposal.params,
                    supportedNamespaces: {
                        eip155: {
                            chains,
                            methods: Object.values(EIP155_SIGNING_METHODS),
                            events: ["accountsChanged", "chainChanged"],
                            accounts,
                        },
                    },
                });
                await web3wallet.approveSession({
                    id: sessionProposal.id,
                    namespaces: approvedNamespaces,
                });
                const newSessions = await web3wallet.getActiveSessions();
                setSessions(newSessions);
            } catch (e) {
                toast({
                    description: "Failed to approve session",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            onClose(); // Close the modal once approved
        }
    };

    const handleApproveTransaction = async () => {
        try {
            const fromAddress = transactionRequest.params.request.params[0].from;
            const fromAddressLC = fromAddress.toLowerCase();
            const safe = safes.find((s) => s.safeAddress.toLowerCase() === fromAddressLC);
            const network = safe ? safe.network : "mainnet";
            await checkNetwork(network);
            const { gnosisSafe, safeService } = await loadSafe(safe.safeAddress, network);
            await createAndApproveTransaction(
                gnosisSafe,
                safeService,
                fromAddress,
                transactionRequest,
                userTeamData.userWalletAddress,
            );
        } catch (error) {
            toast({
                description: "Failed to approve transaction",
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const createWeb3Wallet = async () => {
        if (web3wallet) return;
        const core = new Core({
            projectId: import.meta.env.VITE_WALLETCONNECT_ID,
        });
        const newWallet = await Web3Wallet.init({
            core,
            metadata: {
                name: "Satoshi Safe",
                description: "Why use Fireblocks when you can self custody like this?",
                url: "https://walletconnect.com/",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
        });

        newWallet.on("session_proposal", async (proposal) => {
            setSessionProposal(proposal);
            setModalType("connection");
            onOpen();
        });

        newWallet.on("session_request", async (request) => {
            console.log("pca", "session_request", JSON.stringify(request));
            setTransactionRequest(request); // Set the request details
            setModalType("transaction");
            onOpen();
        });

        setWeb3Wallet(newWallet);
    };

    const pair = async ({ uri }) => {
        if (!web3wallet) return;
        await web3wallet.pair({ uri });
    };

    const disconnect = async (topic) => {
        if (!web3wallet) return;
        await web3wallet.disconnectSession({ topic });
        setSessions(web3wallet.getActiveSessions());
    };

    return {
        createWeb3Wallet,
        pair,
        ConnectionModal: (
            <WCModal
                isOpen={isOpen}
                onClose={onClose}
                sessionProposal={sessionProposal}
                onApproveConnection={handleApproveConnection}
                transactionRequest={transactionRequest}
                modalType={modalType}
                onApproveTransaction={handleApproveTransaction}
            />
        ),
        pairings,
        sessions,
        disconnect,
    };
};

export default useWalletConnect;
