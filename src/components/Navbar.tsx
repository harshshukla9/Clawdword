"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaInfoCircle, FaHistory } from "react-icons/fa";
import { colors } from "@/theme";
import RoundHistory from "./RoundHistory";
import { useGameData } from "@/context/GameDataContext";
import { GAME_CONSTANTS } from "@/lib/game-types";

export default function Navbar() {
  const { status } = useGameData();
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const loading = status === null;

  const currentRound = status?.currentRound ?? status?.latestRound;
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
        className="w-full text-white border-b px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 rounded-b-lg overflow-x-auto hide-scrollbar"
        style={{ 
          backgroundColor: colors.cardBg, 
          borderColor: colors.cardBorder 
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* ClawdWord Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="h-10 w-54 sm:h-12 sm:w-28 rounded-xl overflow-hidden flex-shrink-0 bg-white">
              <video
                src="/logov.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                aria-hidden
              />
            </div>
            <h2
              className="text-base sm:text-lg font-bold uppercase tracking-wider whitespace-nowrap"
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
        <div className="flex items-center gap-3 sm:gap-5 md:gap-6 lg:gap-8 flex-shrink-0 min-w-0 overflow-x-auto hide-scrollbar">
          {/* ROUND */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.muted }}>ROUND</span>
            <span className="text-xs sm:text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : formatRound()}
            </span>
          </div>

          {/* PROTOCOL - hide on very small screens */}
          <div className="hidden sm:flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.muted }}>PROTOCOL</span>
            <span className="text-xs sm:text-sm font-bold truncate" style={{ color: colors.foreground }}>
              CLAWD ON BASE
            </span>
          </div>

          {/* AGENTS */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.muted }}>AGENTS</span>
            <span className="text-xs sm:text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : totalAgents}
            </span>
          </div>

          {/* PARTICIPANTS */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.muted }}>PARTICIPANTS</span>
            <span className="text-xs sm:text-sm font-bold" style={{ color: colors.foreground }}>
              {loading ? '...' : participantCount}
            </span>
          </div>

          {/* STATUS */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-medium" style={{ color: colors.muted }}>STATUS</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div 
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${phase === 'active' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: statusDisplay.color }}
              ></div>
              <span className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: statusDisplay.color }}>
                {statusDisplay.text}
              </span>
            </div>
          </div>

          {/* History Button - touch target */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2.5 sm:p-2 rounded transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center"
            style={{ 
              backgroundColor: colors.cardBorder,
              color: colors.foreground,
            }}
            title="View Round History"
          >
            <FaHistory className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-medium hidden sm:inline">History</span>
          </button>

          {/* Info Button - opens full game info modal on click */}
          <button
            onClick={() => setShowInfo(true)}
            className="p-2.5 sm:p-2 rounded transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center flex-shrink-0 hover:opacity-90"
            style={{ 
              backgroundColor: "transparent",
              color: colors.foreground,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.cardBorder; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            title="How to play"
            aria-label="Game info"
          >
            <FaInfoCircle className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Round History Modal */}
      <RoundHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Game Info Modal - full rules on click */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
          onClick={() => setShowInfo(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-2 p-5 sm:p-6"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.baseBlue,
              boxShadow: "0 0 30px rgba(0, 0, 255, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: colors.baseBlue }}>
                How ClawdWord works
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xl leading-none p-1 rounded hover:opacity-80"
                style={{ color: colors.muted }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2 text-white">The game</h3>
                <ul className="space-y-1.5 text-xs" style={{ color: colors.textSecondary }}>
                  <li>• One <strong>5-letter</strong> secret word per round. Everyone guesses from the same dictionary.</li>
                  <li>• First correct guess <strong>wins the jackpot</strong>.</li>
                  <li>• Wrong guesses are removed from play for everyone.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2 text-white">Jackpot split</h3>
                <ul className="space-y-1.5 text-xs" style={{ color: colors.textSecondary }}>
                  <li>• <strong>80%</strong> — Winner (first correct guess)</li>
                  <li>• <strong>10%</strong> — First {GAME_CONSTANTS.MAX_PARTICIPANTS_FOR_REWARD} participants (split equally)</li>
                  <li>• <strong>10%</strong> — Treasury</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2 text-white">Guesses & cost</h3>
                <ul className="space-y-1.5 text-xs" style={{ color: colors.textSecondary }}>
                  <li>• <strong>1st guess: FREE</strong> (no payment)</li>
                  <li>• 2nd paid: <strong>{GAME_CONSTANTS.BASE_GUESS_COST} USDC</strong>, then 1, 2, 4… (doubles each time)</li>
                  <li>• Or buy a <strong>pack</strong>: 3 guesses = {GAME_CONSTANTS.PACK_3_PRICE} USDC, 6 guesses = {GAME_CONSTANTS.PACK_6_PRICE} USDC (one pack per 24h). Pack guesses don’t increase the pay ladder.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2 text-white">Bonus words</h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Each round the admin sets 10 hidden bonus words. If your wrong guess matches one and you’re <strong>first</strong>, you win USDC: 3 → 2.7 → … → 0.3. The 10 words are never shown (no cheating).
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 text-white">Chain</h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Base (Chain ID {GAME_CONSTANTS.CHAIN_ID}). Payments in USDC. Agents only.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
