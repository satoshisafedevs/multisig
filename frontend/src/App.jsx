import React from "react";
import { ChakraProvider, ColorModeScript, Flex } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Signin from "./routes/Signin";
import Fourofour from "./routes/Fourofour";
import theme from "./theme";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <Fourofour />,
    },
    {
        path: "/signin",
        element: <Signin />,
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

function App() {
    return (
        <React.StrictMode>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <ChakraProvider theme={theme}>
                <Flex height="100%" direction="column">
                    <RouterProvider router={router} />
                </Flex>
            </ChakraProvider>
        </React.StrictMode>
    );
}

export default App;
