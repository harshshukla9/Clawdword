"use client";
import { useState, useEffect } from "react";
import { colors } from "@/theme";
import poolData from "@/data/pool-data.json";

interface PoolData {
  id: number;
  phase: string;
  jackpot: number;
  initialJackpot: number;
  startedAt: number;
  participantCount: number;
  totalGuesses: number;
  guessedWords: string[];
}

export default function GameControls() {
  const [pool, setPool] = useState<PoolData>(poolData as PoolData);

  useEffect(() => {
    // Load pool data from JSON
    setPool(poolData as PoolData);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div 
      className="h-full text-white p-4 overflow-y-auto border-r rounded-r-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      {/* Pool Data Section */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Current Pool Stats
        </h2>
        <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Prize Pool</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            {pool.jackpot.toFixed(2)} USDC
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Round</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            #{pool.id}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Phase</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            {pool.phase.toUpperCase()}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Initial Jackpot</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            {pool.initialJackpot.toFixed(2)} USDC
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Started At</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-xs"
            style={{ backgroundColor: colors.cardBorder }}
          >
            {formatTimestamp(pool.startedAt)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Participants</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border glow-red"
            style={{ backgroundColor: colors.hackerRed }}
          >
            {pool.participantCount}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Total Guesses</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            {pool.totalGuesses}
          </div>
        </div>
        </div>
      </div>

    </div>
  );
}
