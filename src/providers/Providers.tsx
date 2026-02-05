"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastContainer } from "@/components/Toast";
import { ToastProvider, useToastContext } from "@/context/ToastContext";
import { DataContextProvider } from "@/context/DataContext";

const queryClient = new QueryClient();

function ToastContainerWrapper() {
  const { toasts, removeToast } = useToastContext();
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataContextProvider>
        <ToastProvider>
          {children}
          <ToastContainerWrapper />
        </ToastProvider>
      </DataContextProvider>
    </QueryClientProvider>
  );
};

export default Providers;
