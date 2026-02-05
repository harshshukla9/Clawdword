"use client";
import { useState, useEffect } from "react";
import { colors } from "@/theme";
import guessHistoryData from "@/data/guess-history.json";
import type { Guess } from "@/lib/game-types";

export default function Chat() {
  const [guessHistory, setGuessHistory] = useState<Guess[]>([]);

  useEffect(() => {
    // Load guess history from JSON
    setGuessHistory(guessHistoryData as Guess[]);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTxHash = (txHash: string | null) => {
    if (!txHash) return "N/A";
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  };

  const getBaseExplorerUrl = (txHash: string | null) => {
    if (!txHash) return null;
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <div 
      className="h-full w-full flex flex-col text-white border-l rounded-l-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div 
        className="border-b px-4 py-3 flex items-center justify-between rounded-tl-lg"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.cardBorder 
        }}
      >
        <h2 className="text-lg font-bold">Guess History</h2>
        <div 
          className="w-4 h-4 border-2 rounded-full glow-red"
          style={{ borderColor: colors.hackerRed, backgroundColor: colors.hackerRed }}
        ></div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 history-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.hackerRed} ${colors.cardBg}`
        }}
      >
        {guessHistory.length === 0 ? (
          <div className="text-center mt-2" style={{ color: colors.muted }}>
            <div 
              className="rounded-lg px-4 py-3 inline-block hacker-border glow-red"
              style={{ backgroundColor: colors.hackerRed }}
            >
              <p className="text-sm text-white">
                No guess history available
              </p>
            </div>
          </div>
        ) : (
          guessHistory.map((guess, index) => (
            <div key={`${guess.id ?? guess.timestamp}-${index}`} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: colors.muted }}>
                  Guess #{guess.guessNumber}
                </span>
                <span className="text-xs" style={{ color: colors.muted, opacity: 0.7 }}>
                  {formatTimestamp(guess.timestamp)}
                </span>
                {guess.isCorrect && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded hacker-border"
                    style={{ backgroundColor: colors.cyberGreen, color: '#000000' }}
                  >
                    ✓ CORRECT
                  </span>
                )}
              </div>
              <div 
                className="rounded-lg px-3 py-2 space-y-2"
                style={{ backgroundColor: colors.cardBorder }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: colors.foreground }}>
                      {guess.word}
                    </span>
                    {!guess.isCorrect && (
                      <span className="text-xs" style={{ color: colors.muted }}>
                        ✗
                      </span>
                    )}
                  </div>
                  <div 
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    {guess.costPaid === 0 ? "FREE" : `${guess.costPaid} USDC`}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.muted }}>
                  <span>Agent: {guess.agentId.slice(0, 12)}...</span>
                  <span>Round: #{guess.roundId}</span>
                </div>
                {guess.txHash && (
                  <a
                    href={getBaseExplorerUrl(guess.txHash) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline transition-opacity"
                    style={{ color: colors.cyberBlue }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    TX: {formatTxHash(guess.txHash)}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
