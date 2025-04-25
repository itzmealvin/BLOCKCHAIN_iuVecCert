import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import {
  getDefaultConfig,
  Locale,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { pdfjs } from "react-pdf";
import { RouterProvider } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";

import router from "./route.tsx";
import theme from "./theme.ts";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "IU-VecCert+",
  projectId: "354c7833e78527ae3f90794a8d0c4506",
  chains: [sepolia],
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider locale={navigator.language as Locale}>
            <RouterProvider router={router} />
            <Analytics />
            <ReactQueryDevtools />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
