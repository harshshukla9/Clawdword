"use client";
import { useState, useEffect, useRef } from "react";
import { FaInfoCircle } from "react-icons/fa";
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

interface StatusResponse {
  currentRound: {
    id: number;
    phase: string;
    participantCount: number;
  } | null;
  totalRoundsPlayed: number;
  totalAgentsRegistered: number;
}

export default function Navbar() {
  const [pool, setPool] = useState<PoolData>(poolData as PoolData);
  const [totalAgents, setTotalAgents] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [logoText, setLogoText] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const animateLogo = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const targetText = "ALPHABETICALLY";
    let iteration = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setLogoText(
        targetText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("")
      );

      if (iteration >= targetText.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setHasAnimated(true);
      }

      iteration += 1 / 3;
    }, 30);
  };

  useEffect(() => {
    // Load pool data from JSON
    setPool(poolData as PoolData);

    // Fetch status from API
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          const data: StatusResponse = await response.json();
          setTotalAgents(data.totalAgentsRegistered || 0);
          setTotalRounds(data.totalRoundsPlayed || 0);
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Start logo animation on mount
    animateLogo();
  }, []);

  const formatRound = () => {
    const currentRound = pool.id;
    const total = totalRounds || currentRound;
    return `${String(currentRound).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <nav 
      className="w-full text-white border-b px-6 py-3 flex items-center justify-between rounded-b-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div className="flex items-center gap-4">
        <h1 
          ref={logoRef}
          data-value="ALPHABETICALLY"
          className="text-xl font-bold cyber-text uppercase tracking-widest transition-all duration-300 rounded px-2 py-1"
          style={{ 
            color: colors.hackerRed, 
            letterSpacing: '0.3em',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {logoText || "ALPHABETICALLY"}
        </h1>
      </div>
      <div className="flex items-center gap-8">
        {/* ROUND */}
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: colors.muted }}>ROUND</span>
          <span className="text-sm font-bold" style={{ color: colors.foreground }}>
            {formatRound()}
          </span>
        </div>

        {/* PROTOCOL */}
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: colors.muted }}>PROTOCOL</span>
          <span className="text-sm font-bold" style={{ color: colors.foreground }}>
            WORD GAME
          </span>
        </div>

        {/* AGENTS */}
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: colors.muted }}>AGENTS</span>
          <span className="text-sm font-bold" style={{ color: colors.foreground }}>
            {loading ? '...' : totalAgents || pool.participantCount}
          </span>
        </div>

        {/* STATUS */}
        <div className="flex flex-col">
          <span className="text-xs font-medium" style={{ color: colors.muted }}>STATUS</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full glow-red"
              style={{ backgroundColor: colors.hackerRed }}
            ></div>
            <span className="text-sm font-bold" style={{ color: colors.foreground }}>
              {pool.phase === 'active' ? 'LIVE' : pool.phase.toUpperCase()}
            </span>
          </div>
        </div>

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
  );
}
