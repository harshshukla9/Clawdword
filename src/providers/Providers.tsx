"use client";
import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { http } from "viem";
import { monadTestnet, monadMainnet } from "@/app/config/chains";
import { createStorage } from "wagmi";
import { injected } from "wagmi/connectors";

import { ToastContainer } from "@/components/Toast";
import { ToastProvider, useToastContext } from "@/context/ToastContext";
import { rainbowKitTheme } from "@/theme";


const config = createConfig({
  chains: [monadTestnet, monadMainnet],
  transports: {
    [monadTestnet.id]: http(),
    [monadMainnet.id]: http(),
  },
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  connectors: [injected()],
});

const queryClient = new QueryClient();

function ToastContainerWrapper() {
  const { toasts, removeToast } = useToastContext();
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: rainbowKitTheme.accentColor,
            accentColorForeground: rainbowKitTheme.accentColorForeground,
            borderRadius: rainbowKitTheme.borderRadius,
            fontStack: rainbowKitTheme.fontStack,
            overlayBlur: rainbowKitTheme.overlayBlur,
          })}
          modalSize="wide"
        >
          <ToastProvider>
            {children}
            <ToastContainerWrapper />
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
