import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
// eslint-disable-next-line import/no-extraneous-dependencies
import { buildApprovedNamespaces } from "@walletconnect/utils";
import { useDisclosure, useToast } from "@chakra-ui/react";
import ConnectionModal from "../components/actions/ConnectionModal";
import { useUser } from "../providers/User";
import { NETWORK_EIP, EIP155_SIGNING_METHODS } from "../utils/networkeip";

const useWalletConnect = () => {
    // Initialize WalletConnect
    const [web3wallet, setWeb3Wallet] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [sessionProposal, setSessionProposal] = useState(null);
    const [pairings, setPairings] = useState([]);
    const [sessions, setSessions] = useState([]);
    const { currentTeam } = useUser();
    const toast = useToast();

    useEffect(() => {
        if (web3wallet) {
            setPairings(web3wallet.core.pairing.getPairings());
            setSessions(web3wallet.getActiveSessions());
        }
    }, [web3wallet]);

    const handleApprove = async () => {
        if (sessionProposal) {
            // Logic to approve the session...
            // Extract unique networks from data
            const { safes } = currentTeam;
            const uniqueNetworks = [...new Set(safes.map(({ network }) => network))];
            const chains = uniqueNetworks
                .map((network) => NETWORK_EIP[network])
                .filter((chainId) => chainId !== undefined);

            const accounts = safes
                .map(({ network, safeAddress }) => {
                    const chainId = NETWORK_EIP[network];
                    return chainId ? `${chainId}:${safeAddress}` : null;
                })
                .filter((account) => account !== null);
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
            try {
                await web3wallet.approveSession({
                    id: sessionProposal.id,
                    namespaces: approvedNamespaces,
                });
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
            onOpen(); // Open the modal when session proposal event occurs
        });

        newWallet.on("session_request", async (sessionRequest) => {
            console.log("pca", "session_request", JSON.stringify(sessionRequest));
            // pass request to wallet and return result
        });
        setWeb3Wallet(newWallet);
    };

    const pair = async ({ uri }) => {
        if (!web3wallet) return;
        await web3wallet.pair({ uri });
    };

    return {
        createWeb3Wallet,
        pair,
        ConnectionModal: (
            <ConnectionModal
                isOpen={isOpen}
                onClose={onClose}
                sessionProposal={sessionProposal}
                onApprove={handleApprove}
            />
        ),
        pairings,
        sessions,
    };
};

export default useWalletConnect;
