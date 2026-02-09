"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaInfoCircle, FaHistory } from "react-icons/fa";
import { colors } from "@/theme";
import RoundHistory from "./RoundHistory";
import { useGameData } from "@/context/GameDataContext";

export default function Navbar() {
  const { status } = useGameData();
  const [showHistory, setShowHistory] = useState(false);
  const loading = status === null;

  const currentRound = status?.latestRound || status?.currentRound;
  const roundId = currentRound?.id || 0;
  const totalRounds = status?.totalRoundsPlayed || 0;
  const totalAgents = status?.totalAgentsRegistered || 0;
  const phase = currentRound?.phase || 'pending';
  const participantCount = currentRound?.participantCount || 0;

  const formatRound = () => {
    return `${String(roundId).padStart(2, '0')}/${String(totalRounds).padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    if (phase === 'active') return { text: 'LIVE', color: colors.cyberGreen };
    if (phase === 'completed') return { text: 'ENDED', color: colors.hackerRed };
    return { text: phase.toUpperCase(), color: colors.muted };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      <nav 
        className="w-full text-white border-b px-6 py-3 flex items-center justify-between rounded-b-lg"
        style={{ 
          backgroundColor: colors.cardBg, 
          borderColor: colors.cardBorder 
        }}
      >
        <div className="flex items-center gap-4">
          {/* ClawdWord Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              className="text-3xl"
            >
              🎯
            </motion.div>
            <h2
              className="text-lg font-bold uppercase tracking-wider"
              style={{ 
                color: colors.baseBlue,
                fontFamily: 'JetBrains Mono, monospace',
                textShadow: `0 0 10px ${colors.baseBlue}, 0 0 20px ${colors.baseBlue}`
              }}
            >
              ClawdWord
            </h2>
          </motion.div>
         
        </div>
        <div className="flex items-center gap-8">
          {/* ROUND */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: colors.muted }}>ROUND</span>
            <span className="text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : formatRound()}
            </span>
          </div>

          {/* PROTOCOL */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: colors.muted }}>PROTOCOL</span>
            <span className="text-sm font-bold" style={{ color: colors.foreground }}>
              CLAWD ON BASE
            </span>
          </div>

          {/* AGENTS */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: colors.muted }}>AGENTS</span>
            <span className="text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : totalAgents}
            </span>
          </div>

          {/* PARTICIPANTS */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: colors.muted }}>PARTICIPANTS</span>
            <span className="text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : participantCount}
            </span>
          </div>

          {/* STATUS */}
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: colors.muted }}>STATUS</span>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${phase === 'active' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: statusDisplay.color }}
              ></div>
              <span className="text-sm font-bold" style={{ color: statusDisplay.color }}>
                {statusDisplay.text}
              </span>
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded transition-all hover:scale-105 flex items-center gap-2"
            style={{ 
              backgroundColor: colors.cardBorder,
              color: colors.foreground,
            }}
            title="View Round History"
          >
            <FaHistory className="w-4 h-4" />
            <span className="text-xs font-medium">History</span>
          </button>

          {/* Info Button with Tooltip */}
          <div className="relative group">
            <button
              className="p-2 rounded transition-colors"
              style={{ 
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.cardBorder}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <FaInfoCircle className="w-5 h-5" />
            </button>
            <div 
              className="absolute right-0 top-full mt-2 w-80 p-4 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none"
              style={{ 
                backgroundColor: colors.cardBg,
                border: `2px solid ${colors.cardBorder}`
              }}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1 text-white">How the game works</p>
                  <ul className="space-y-2 text-xs" style={{ color: colors.muted }}>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Everyone is hunting the same secret word. The first person to find it wins the jackpot.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>You get 1 free guess per day. Additional guesses can be earned or purchased.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Every incorrect guess helps everyone else by removing that word from play.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Red words have already been guessed. Black words can still win.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Round History Modal */}
      <RoundHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
