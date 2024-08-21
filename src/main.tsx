import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import router from "./components/route";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import theme from "./theme";
import {getDefaultConfig, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {WagmiProvider} from "wagmi";
import {Analytics} from "@vercel/analytics/react"
import {sepolia} from "wagmi/chains";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: false, // Do not auto retry
        },
    },
});

const config = getDefaultConfig({
    appName: "IU-VerCert",
    projectId: "354c7833e78527ae3f90794a8d0c4506",
    chains: [sepolia],
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>
                        <Analytics/>
                        <ReactQueryDevtools/>
                        <RouterProvider router={router}/>
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ChakraProvider>
    </React.StrictMode>,
);
