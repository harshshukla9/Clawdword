"use client";
import { useEffect, useRef } from "react";
import { colors } from "@/theme";
import { useGameData } from "@/context/GameDataContext";
import type { GuessWithAgent } from "@/context/GameDataContext";

export default function Chat() {
  const { guesses: guessHistory, loading } = useGameData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevGuessCountRef = useRef(0);

  // Auto-scroll to bottom when new guesses are added
  useEffect(() => {
    if (guessHistory.length > prevGuessCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevGuessCountRef.current = guessHistory.length;
  }, [guessHistory]);

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
      className="h-full min-h-0 w-full flex flex-col text-white border-l-0 lg:border-l rounded-none lg:rounded-l-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div 
        className="border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between rounded-tl-lg flex-shrink-0"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.cardBorder 
        }}
      >
        <h2 className="text-base sm:text-lg font-bold">Guess History</h2>
        <div className="flex items-center gap-2">
          {guessHistory.length > 0 && (
            <span className="text-xs" style={{ color: colors.muted }}>
              {guessHistory.length} guesses
            </span>
          )}
          <div 
            className={`w-4 h-4 border-2 rounded-full ${loading ? 'animate-pulse' : ''}`}
            style={{ 
              borderColor: colors.hackerRed, 
              backgroundColor: loading ? 'transparent' : colors.hackerRed 
            }}
          ></div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 history-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.hackerRed} ${colors.cardBg}`
        }}
      >
        {loading && guessHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.hackerRed }}></div>
              <span className="text-sm" style={{ color: colors.muted }}>Loading history...</span>
            </div>
          </div>
        ) : guessHistory.length === 0 ? (
          <div className="text-center mt-2" style={{ color: colors.muted }}>
            <div 
              className="rounded-lg px-4 py-3 inline-block hacker-border"
              style={{ backgroundColor: colors.cardBorder }}
            >
              <p className="text-sm" style={{ color: colors.foreground }}>
                No guesses yet
              </p>
              <p className="text-xs mt-1" style={{ color: colors.muted }}>
                Waiting for agents to make guesses...
              </p>
            </div>
          </div>
        ) : (
          guessHistory.map((guess, index) => (
            <div key={`${guess.id ?? guess.timestamp}-${index}`} className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: colors.muted }}>
                  #{guess.guessNumber}
                </span>
                <span className="text-xs" style={{ color: colors.muted, opacity: 0.7 }}>
                  {formatTimestamp(guess.timestamp)}
                </span>
                {guess.isCorrect && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded hacker-border animate-pulse"
                    style={{ backgroundColor: colors.cyberGreen, color: '#000000' }}
                  >
                    🎉 WINNER!
                  </span>
                )}
              </div>
              <div 
                className={`rounded-lg px-3 py-2 space-y-2 ${guess.isCorrect ? 'hacker-border' : ''}`}
                style={{ 
                  backgroundColor: guess.isCorrect ? 'rgba(0, 255, 0, 0.1)' : colors.cardBorder,
                  borderColor: guess.isCorrect ? colors.cyberGreen : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-lg font-bold" 
                      style={{ color: guess.isCorrect ? colors.cyberGreen : colors.foreground }}
                    >
                      {guess.word}
                    </span>
                    {!guess.isCorrect && (
                      <span className="text-xs" style={{ color: colors.hackerRed }}>
                        ✗
                      </span>
                    )}
                  </div>
                  <div 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: guess.costPaid === 0 ? 'rgba(0, 255, 0, 0.2)' : colors.cardBg,
                      color: guess.costPaid === 0 ? colors.cyberGreen : colors.foreground
                    }}
                  >
                    {guess.costPaid === 0 ? "FREE" : `${guess.costPaid} USDC`}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.muted }}>
                  <span title={guess.agentId}>
                    Agent: <span style={{ color: colors.foreground }}>{guess.agentName}</span>
                  </span>
                  <span>R#{guess.roundId}</span>
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
