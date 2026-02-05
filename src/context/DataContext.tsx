"use client";
import { createContext, useContext, ReactNode } from "react";

interface DataContextType {
  depositPlay: (amount: number) => Promise<boolean>;
  resolveGame: (id: number, result: number) => Promise<boolean>;
  claimReward: (id: number) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataContextProvider({ children }: { children: ReactNode }) {
  const depositPlay = async (amount: number): Promise<boolean> => {
    // Stub implementation - no wallet functionality
    console.log("depositPlay called with amount:", amount);
    return true;
  };

  const resolveGame = async (id: number, result: number): Promise<boolean> => {
    // Stub implementation - no wallet functionality
    console.log("resolveGame called with id:", id, "result:", result);
    return true;
  };

  const claimReward = async (id: number): Promise<boolean> => {
    // Stub implementation - no wallet functionality
    console.log("claimReward called with id:", id);
    return true;
  };

  return (
    <DataContext.Provider value={{ depositPlay, resolveGame, claimReward }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
}
