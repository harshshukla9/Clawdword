"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

// Shared types for status (from /api/status)
export interface RoundData {
  id: number;
  phase: string;
  jackpot?: number;
  initialJackpot?: number;
  startedAt?: number;
  endedAt?: number;
  participantCount?: number;
  totalGuesses?: number;
  guessedWordsCount?: number;
  remainingWordsCount?: number;
  guessedWords?: string[];
  secretWord?: string;
  winnerId?: string;
  winnerWallet?: string;
  winnerName?: string;
  wordHash?: string;
  prizeDistribution?: {
    winnerAmount: number;
    participantsAmount: number;
    participantsShare: number;
    treasuryAmount: number;
    participants?: { agentId: string; walletAddress: string; share: number }[];
  };
  bonusDiscoveries?: { word: string; agentId: string; agentName?: string; amount: number; order: number; timestamp: number }[];
}

export interface StatusResponse {
  serverTime?: number;
  currentRound: RoundData | null;
  latestRound: RoundData | null;
  lastCompletedRound?: RoundData | null;
  totalRoundsPlayed: number;
  totalAgentsRegistered: number;
  gameConstants?: Record<string, unknown>;
}

// Words (from /api/words)
export interface WordsResponse {
  roundId: number | null;
  totalWords: number;
  guessedWords: string[];
  guessedCount: number;
  availableWords: string[];
  availableCount: number;
}

// Guess (from /api/game/guesses)
export interface GuessWithAgent {
  id: string;
  roundId: number;
  agentId: string;
  agentName: string;
  word: string;
  isCorrect: boolean;
  guessNumber: number;
  costPaid: number;
  txHash: string | null;
  timestamp: number;
}

interface GameDataContextType {
  status: StatusResponse | null;
  wordsData: WordsResponse | null;
  guesses: GuessWithAgent[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

const STORAGE_KEY = "clawdword_game_data";
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 min - use cache if newer than this
const REFETCH_INTERVAL_MS = 10 * 60 * 1000; // refetch when no live round
const LIVE_ROUND_REFETCH_MS = 60 * 1000; // refetch every 1 min when there's a live round

interface CachedGameData {
  status: StatusResponse | null;
  wordsData: WordsResponse | null;
  guesses: GuessWithAgent[];
  fetchedAt: number;
}

function getCached(): CachedGameData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedGameData;
    if (!parsed || typeof parsed.fetchedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCached(data: Omit<CachedGameData, "fetchedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, fetchedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}

function isCacheFresh(cached: CachedGameData): boolean {
  return Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS;
}

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [wordsData, setWordsData] = useState<WordsResponse | null>(null);
  const [guesses, setGuesses] = useState<GuessWithAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const inFlightRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const [statusRes, wordsRes, guessesRes] = await Promise.all([
        fetch("/api/status"),
        fetch("/api/words"),
        fetch("/api/game/guesses"),
      ]);

      let newStatus: StatusResponse | null = null;
      let newWordsData: WordsResponse | null = null;
      let newGuesses: GuessWithAgent[] = [];

      if (statusRes.ok) {
        newStatus = await statusRes.json();
        setStatus(newStatus);
      }
      if (wordsRes.ok) {
        newWordsData = await wordsRes.json();
        setWordsData(newWordsData);
      }
      if (guessesRes.ok) {
        const data = await guessesRes.json();
        newGuesses = data.guesses || [];
        setGuesses(newGuesses);
      }

      setCached({ status: newStatus, wordsData: newWordsData, guesses: newGuesses });
    } catch (error) {
      console.error("[GameDataContext] fetch error:", error);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      // Always fetch from API on load/refresh so user gets fresh data (no cache skip)
      fetchAll();
    }

    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    const intervalMs =
      status?.currentRound?.phase === "active"
        ? LIVE_ROUND_REFETCH_MS
        : REFETCH_INTERVAL_MS;
    intervalIdRef.current = setInterval(() => fetchAll(), intervalMs);
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [fetchAll, status?.currentRound?.phase]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchAll();
  }, [fetchAll]);

  return (
    <GameDataContext.Provider
      value={{
        status,
        wordsData,
        guesses,
        loading,
        refetch,
      }}
    >
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData() {
  const ctx = useContext(GameDataContext);
  if (ctx === undefined) {
    throw new Error("useGameData must be used within a GameDataProvider");
  }
  return ctx;
}
