import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Subscribe from "./routes/Subscribe";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/subscribe",
        element: <Subscribe />,
    },
]);

function App() {
    return (
        <React.StrictMode>
            <ChakraProvider>
                <RouterProvider router={router} />
            </ChakraProvider>
        </React.StrictMode>
    );
}

export default App;
