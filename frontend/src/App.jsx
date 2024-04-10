import { ChakraProvider, ColorModeScript, Flex } from "@chakra-ui/react";
import { Buffer } from "buffer";
import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { arbitrum, aurora, avalanche, base, bsc, mainnet, optimism, polygon, sepolia } from "wagmi/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import SafeBalance from "./providers/SafeBalance";
import Subscriptions from "./providers/Subscriptions";
import Transactions from "./providers/Transactions";
import User from "./providers/User";
import Wagmi from "./providers/Wagmi";
import WalletConnect from "./providers/WalletConnect";
import Admin from "./routes/Admin";
import Fourofour from "./routes/Fourofour";
import Home from "./routes/Home";
import Invitations from "./routes/Invitations";
import Signin from "./routes/Signin";
import TeamPicker from "./routes/TeamPicker";
import theme from "./theme";
import Fonts from "./components/Fonts";

// need this for vite build and ethers with gnosis
globalThis.Buffer = Buffer;

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <AuthenticatedRoute>
                <TeamPicker />
            </AuthenticatedRoute>
        ),
        errorElement: <Fourofour />,
    },
    {
        path: "/signin",
        element: <Signin />,
    },
    {
        path: "/team/:slug",
        element: (
            <AuthenticatedRoute>
                <Home />
            </AuthenticatedRoute>
        ),
    },
    {
        path: "/team/:slug/admin",
        element: (
            <AuthenticatedRoute>
                <Admin />
            </AuthenticatedRoute>
        ),
    },
    {
        path: "/invitation",
        element: <Invitations />,
    },
]);

// this code clears browsers console between hot relaods
if (import.meta.hot) {
    import.meta.hot.on(
        "vite:beforeUpdate",
        /* eslint-disable-next-line no-console */
        () => console.clear(),
    );
}

let chainList = [arbitrum, aurora, avalanche, base, bsc, mainnet, optimism, polygon, sepolia];

if (import.meta.env.MODE !== "development") {
    chainList = chainList.filter((el) => el.network !== "sepolia");
}

const { chains, publicClient, webSocketPublicClient } = configureChains(chainList, [
    // alchemyProvider({ apiKey: 'yourAlchemyApiKey' }),
    // infuraProvider({ apiKey: 'yourInfuraApiKey' }),
    publicProvider(),
]);

const config = createConfig({
    autoConnect: true,
    chains,
    publicClient,
    webSocketPublicClient,
    connectors: [new MetaMaskConnector({ chains })],
});

function App() {
    return (
        <React.StrictMode>
            <Fonts />
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider theme={theme}>
                <Flex height="100%" direction="column">
                    <WagmiConfig config={config}>
                        <User>
                            <Subscriptions>
                                <Wagmi>
                                    <SafeBalance>
                                        <Transactions>
                                            <WalletConnect>
                                                <RouterProvider router={router} />
                                            </WalletConnect>
                                        </Transactions>
                                    </SafeBalance>
                                </Wagmi>
                            </Subscriptions>
                        </User>
                    </WagmiConfig>
                </Flex>
            </ChakraProvider>
        </React.StrictMode>
    );
}

export default App;
