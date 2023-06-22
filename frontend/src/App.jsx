import React from "react";
import { ChakraProvider, ColorModeScript, Flex } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { mainnet, arbitrum, optimism, polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import FirestoreUser from "./providers/FirestoreUser";
import TeamPicker from "./routes/TeamPicker";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Home from "./routes/Home";
import Signin from "./routes/Signin";
import Fourofour from "./routes/Fourofour";
import theme from "./theme";

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
]);

// this code clears browsers console between hot relaods
if (import.meta.hot) {
    import.meta.hot.on(
        "vite:beforeUpdate",
        /* eslint-disable-next-line no-console */
        () => console.clear(),
    );
}
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, arbitrum, optimism, polygon],
    [
        // alchemyProvider({ apiKey: 'yourAlchemyApiKey' }),
        // infuraProvider({ apiKey: 'yourInfuraApiKey' }),
        publicProvider(),
    ],
);

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
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider theme={theme}>
                <Flex height="100%" direction="column">
                    <WagmiConfig config={config}>
                        <FirestoreUser>
                            <RouterProvider router={router} />
                        </FirestoreUser>
                    </WagmiConfig>
                </Flex>
            </ChakraProvider>
        </React.StrictMode>
    );
}

export default App;
