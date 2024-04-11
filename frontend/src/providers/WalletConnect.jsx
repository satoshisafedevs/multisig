import { useDisclosure, useToast } from "@chakra-ui/react";
import { Web3Wallet } from "@walletconnect/web3wallet";
import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { buildApprovedNamespaces } from "@walletconnect/utils";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Core } from "@walletconnect/core";
import WCModal from "../components/actions/WCModal";
import useGnosisSafe from "../hooks/useGnosisSafe";
import checkNetwork from "../utils/checkNetwork";
import { EIP155_SIGNING_METHODS, NETWORK_EIP } from "../utils/networkeip";
import { useUser } from "./User";

const WalletConnectContext = createContext();
const WalletConnectProvider = WalletConnectContext.Provider;

export function useWalletConnect() {
    return useContext(WalletConnectContext);
}

function WalletConnect({ children }) {
    const [web3wallet, setWeb3Wallet] = useState(null);
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [transactionRequest, setTransactionRequest] = useState(null);
    const [sessionProposal, setSessionProposal] = useState(null);
    const [modalType, setModalType] = useState("transaction");
    const [namespaceInfoError, setNamespaceInfoError] = useState("");
    const [pairings, setPairings] = useState([]);
    const [isPairingLoading, setIsPairingLoading] = useState(false);
    const [isApprovingSession, setIsApprovingSession] = useState(false);
    const [sessions, setSessions] = useState(null);
    const [selectedSafes, setSelectedSafes] = useState([]);
    const isGettingNamespaceInfoRef = useRef({ loading: false });
    const setIsGettingNamespaceInfo = (value) => {
        isGettingNamespaceInfoRef.current.loading = value;
    };
    const [requiredNamespaces, setRequiredNamespaces] = useState(null);
    const { userTeamData, safes, currentTeam } = useUser();
    const { createAndApproveTransaction, loadSafe } = useGnosisSafe();
    const toast = useToast();

    const disconnectAll = async () => {
        if (!web3wallet) return;

        // Assuming getActiveSessions() returns an object where keys are session identifiers
        const activeSessions = web3wallet.getActiveSessions();
        console.log("Active sessions before disconnect:", activeSessions);

        Object.keys(sessions).forEach(async (key) => {
            const session = sessions[key];
            // Log the session topic you are trying to disconnect
            console.log("Attempting to disconnect session with topic:", session.topic);
            try {
                // Check if the session topic exists in the active sessions object
                if (session.topic in activeSessions) {
                    await web3wallet.disconnectSession({ topic: session.topic });
                } else {
                    console.log("Session topic not found in active sessions:", session.topic);
                }
            } catch (error) {
                // Handle errors such as session not found
                console.error("Error disconnecting session:", error);
            }
        });

        // // Update sessions state after disconnect attempts
        setSessions(web3wallet.getActiveSessions());
    };

    useEffect(() => {
        disconnectAll();
        console.log("disconnect all");
    }, [currentTeam]);

    useEffect(() => {
        if (web3wallet) {
            setPairings(web3wallet.core.pairing.getPairings());
            setSessions(web3wallet.getActiveSessions());
        }
    }, [web3wallet]);

    const resetConnectionStatus = () => {
        setSelectedSafes([]);
        setNamespaceInfoError();
        setRequiredNamespaces();
        setSessionProposal();
        setIsPairingLoading();
        setIsApprovingSession();
    };

    const getChainsAndAccounts = () => {
        // Filter the `safes` array to only include safes that are in the `selectedSafes` array
        const filteredSafes = safes.filter((safe) => selectedSafes.includes(safe.safeAddress));

        // Now, map over the filtered safes to get unique networks and accounts
        const uniqueNetworks = [...new Set(filteredSafes.map((safe) => safe.network))];
        const chains = uniqueNetworks.map((network) => NETWORK_EIP[network]).filter((chainId) => chainId !== undefined);

        const accounts = filteredSafes
            .map((safe) => {
                const chainId = NETWORK_EIP[safe.network];
                return chainId ? `${chainId}:${safe.safeAddress}` : null;
            })
            .filter((account) => account !== null);

        return { chains, accounts, uniqueNetworks };
    };

    const handleApproveConnection = async (cb) => {
        if (sessionProposal) {
            // Logic to approve the session...
            // Extract unique networks from data
            try {
                setIsApprovingSession(true);
                const { chains, accounts } = getChainsAndAccounts();
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
                console.log("New sessions after approve:", newSessions);
                setSessions(newSessions);
                toast({
                    description: "Added new connection",
                    position: "top",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                cb();
            } catch (e) {
                console.log("Failed to approve session", e);
                toast({
                    description: "Failed to approve session",
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setIsApprovingSession(false);
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
            const satoshiData = {
                type: "walletconnect",
                from: safe.safeAddress,
                network,
            };
            await createAndApproveTransaction(
                network,
                gnosisSafe,
                safeService,
                fromAddress,
                transactionRequest,
                userTeamData.userWalletAddress,
                satoshiData,
            );
        } catch (error) {
            console.log(error);
            toast({
                description: "Failed to approve transaction",
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const disconnect = async (topic) => {
        if (!web3wallet) return;
        await web3wallet.disconnectSession({ topic });
        setSessions(web3wallet.getActiveSessions());
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
            if (isGettingNamespaceInfoRef.current.loading) {
                setRequiredNamespaces(proposal?.params?.requiredNamespaces);
                setIsGettingNamespaceInfo(false);
            } else {
                setSessionProposal(proposal);
                setIsPairingLoading(false);
            }
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
        setIsGettingNamespaceInfo(false);
        setIsPairingLoading(true);
        if (!web3wallet) return;
        await web3wallet.pair({ uri });
    };

    const getNamespaceInfo = async ({ uri }) => {
        setIsGettingNamespaceInfo(true);
        setRequiredNamespaces(null);
        if (!web3wallet) return;
        if (!uri) {
            setNamespaceInfoError();
            setIsGettingNamespaceInfo(false);
            return;
        }
        try {
            await web3wallet.pair({ uri });
            setNamespaceInfoError();
        } catch (e) {
            if (e.message.includes("Missing or invalid. pair() uri:")) {
                setNamespaceInfoError("Please enter valid URI.");
            }
            setIsGettingNamespaceInfo(false);
        }
    };

    const values = useMemo(
        () => ({
            createWeb3Wallet,
            pair,
            getNamespaceInfo,
            requiredNamespaces,
            isGettingNamespaceInfoRef,
            isPairingLoading,
            isApprovingSession,
            setNamespaceInfoError,
            setRequiredNamespaces,
            handleApproveConnection,
            setSessionProposal,
            resetConnectionStatus,
            sessionProposal,
            namespaceInfoError,
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
            disconnectAll,
            selectedSafes,
            setSelectedSafes,
        }),
        [
            pairings,
            sessions,
            requiredNamespaces,
            namespaceInfoError,
            sessionProposal,
            transactionRequest,
            isPairingLoading,
            isApprovingSession,
            modalType,
            isOpen,
            selectedSafes,
            setIsPairingLoading,
            resetConnectionStatus,
            setSelectedSafes,
            handleApproveTransaction,
        ],
    );
    return <WalletConnectProvider value={values}>{children}</WalletConnectProvider>;
}

WalletConnect.propTypes = {
    children: PropTypes.node.isRequired,
};

export default WalletConnect;
