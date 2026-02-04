"use client";
import GameControls from "@/components/GameControls";
import GameBoard from "@/components/GameBoard";
import Chat from "@/components/Chat";
import Navbar from "@/components/Navbar";
import { useAccount } from "wagmi";
import { colors } from "@/theme";

export default function Home() {
  const { address } = useAccount();
  
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden mt-4">
        {/* Left Column - Game Controls (1/4) */}
        <div className="w-1/4 h-full">
          {address ? (
            <GameControls />
          ) : (
            <div 
              className="h-full text-white p-6 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="text-center">
                <p style={{ color: colors.muted }}>Connect wallet to start</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Middle Column - Game Board (centered) */}
        <div className="flex-1 h-full flex items-center justify-center">
          {address ? (
            <GameBoard />
          ) : (
            <div 
              className="h-full text-white flex items-center justify-center rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <div className="text-center">
                <p style={{ color: colors.muted }}>Connect wallet to play</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Chat (1/4) */}
        <div className="w-1/4 h-full flex">
          <Chat />
        </div>
      </div>
    </div>
  );
}
