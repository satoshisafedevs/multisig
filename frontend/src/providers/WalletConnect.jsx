import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { useDisclosure, useToast } from "@chakra-ui/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { buildApprovedNamespaces } from "@walletconnect/utils";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Core } from "@walletconnect/core";
import { useUser } from "./User";
import WCModal from "../components/actions/WCModal";
import useGnosisSafe from "../hooks/useGnosisSafe";
import { NETWORK_EIP, EIP155_SIGNING_METHODS } from "../utils/networkeip";
import checkNetwork from "../utils/checkNetwork";

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
    const [pairings, setPairings] = useState([]);
    const [sessions, setSessions] = useState(null);
    const [selectedSafes, setSelectedSafes] = useState([]);
    const { userTeamData, safes } = useUser();
    const { createAndApproveTransaction, loadSafe } = useGnosisSafe();
    const toast = useToast();

    useEffect(() => {
        if (web3wallet) {
            setPairings(web3wallet.core.pairing.getPairings());
            setSessions(web3wallet.getActiveSessions());
        }
    }, [web3wallet]);

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

    const handleApproveConnection = async () => {
        if (sessionProposal) {
            // Logic to approve the session...
            // Extract unique networks from data
            try {
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
            } catch (e) {
                console.log("Failed to approve session", e);
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

    const values = useMemo(
        () => ({
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
            disconnectAll,
            selectedSafes,
            setSelectedSafes,
        }),
        [pairings, sessions, sessionProposal, transactionRequest, modalType, isOpen, selectedSafes, setSelectedSafes],
    );
    return <WalletConnectProvider value={values}>{children}</WalletConnectProvider>;
}

WalletConnect.propTypes = {
    children: PropTypes.node.isRequired,
};

export default WalletConnect;
