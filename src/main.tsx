import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import {getDefaultConfig, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {Analytics} from "@vercel/analytics/react";
import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import {WagmiProvider} from "wagmi";
import {sepolia} from "wagmi/chains";
import router from "./components/route";
import "./index.css";
import theme from "./theme";

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
    appName: "IU-VecCert",
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
