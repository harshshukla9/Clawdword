"use client";
import { useState, useEffect } from "react";
import { colors } from "@/theme";

interface StatusResponse {
  currentRound: {
    id: number;
    phase: string;
    guessedWords: string[];
  } | null;
  latestRound: {
    id: number;
    phase: string;
    secretWord?: string;
    winnerName?: string;
    guessedWords: string[];
  } | null;
}

interface WordsResponse {
  roundId: number | null;
  totalWords: number;
  guessedWords: string[];
  guessedCount: number;
  availableWords: string[];
  availableCount: number;
}

export default function GameBoard() {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [wordsRes, statusRes] = await Promise.all([
        fetch('/api/words'),
        fetch('/api/status')
      ]);
      
      if (wordsRes.ok) {
        const data: WordsResponse = await wordsRes.json();
        setAvailableWords(data.availableWords || []);
        setGuessedWords(data.guessedWords || []);
      }
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const isCompleted = status?.latestRound?.phase === 'completed';
  const secretWord = status?.latestRound?.secretWord;
  const winnerName = status?.latestRound?.winnerName;
  const hasActiveRound = status?.currentRound !== null;

  return (
    <div 
      className="text-white p-4 sm:p-6 flex flex-col items-center rounded-lg h-full w-full overflow-y-auto"
      style={{ 
        backgroundColor: colors.background
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Round Complete Banner */}
        {isCompleted && secretWord && (
          <div 
            className="mb-6 p-6 rounded-lg text-center hacker-border"
            style={{ 
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              borderColor: colors.cyberGreen,
              boxShadow: `0 0 30px rgba(0, 255, 0, 0.3)`
            }}
          >
            <div className="text-4xl mb-3 animate-bounce">🎉</div>
            <div className="text-2xl font-bold mb-2" style={{ color: colors.cyberGreen }}>
              ROUND COMPLETE!
            </div>
            <div className="text-lg mb-4" style={{ color: colors.foreground }}>
              The secret word was:
            </div>
            
            {/* Secret Word Display */}
            <div className="grid grid-cols-5 gap-2 justify-center max-w-xs mx-auto mb-4">
              {Array.from(secretWord).map((letter, i) => (
                <div
                  key={`secret-${i}`}
                  className="text-center text-2xl sm:text-3xl font-bold rounded-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-pulse"
                  style={{ 
                    border: `3px solid ${colors.cyberGreen}`, 
                    backgroundColor: 'rgba(0, 255, 0, 0.2)',
                    color: colors.cyberGreen,
                    boxShadow: `0 0 15px rgba(0, 255, 0, 0.5)`
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>

            {winnerName && (
              <div className="text-lg" style={{ color: colors.foreground }}>
                Winner: <span style={{ color: colors.cyberGreen, fontWeight: 'bold' }}>{winnerName}</span>
              </div>
            )}
            
            <div className="mt-4 text-sm" style={{ color: colors.muted }}>
              Waiting for the next round to start...
            </div>
          </div>
        )}

        {/* No Active Round Message */}
        {!hasActiveRound && !isCompleted && !loading && (
          <div 
            className="mb-6 p-6 rounded-lg text-center hacker-border"
            style={{ 
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderColor: '#FFA500'
            }}
          >
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-xl font-bold mb-2" style={{ color: '#FFA500' }}>
              NO ACTIVE ROUND
            </div>
            <div className="text-sm" style={{ color: colors.muted }}>
              Waiting for admin to start a new round...
            </div>
          </div>
        )}

        {/* Guessed words - show crossed out words */}
        {guessedWords.length > 0 && (
          <>
            <div className="text-center mb-3">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: colors.cardBorder, color: colors.muted }}>
                Wrong Guesses ({guessedWords.length})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-4 justify-center px-2">
              {guessedWords.map((word, rowIndex) =>
                Array.from(word).map((letter, i) => (
                  <div
                    key={`guessed-${rowIndex}-${i}`}
                    className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
                    style={{ 
                      border: `2px solid ${colors.hackerRed}`, 
                      backgroundColor: "rgba(255, 0, 64, 0.1)",
                      color: colors.hackerRed,
                      opacity: 0.7
                    }}
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Available words - show remaining words when round is active */}
        {loading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.cyberGreen }}></div>
              <span className="text-sm" style={{ color: colors.muted }}>Loading words...</span>
            </div>
          </div>
        ) : hasActiveRound && availableWords.length > 0 ? (
          <div className="mt-4">
            <div className="text-center mb-3">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: colors.cardBorder, color: colors.cyberGreen }}>
                Available Words ({availableWords.length})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 justify-center px-2">
              {availableWords.map((word, rowIndex) =>
                Array.from(word).map((letter, i) => (
                  <div
                    key={`available-${rowIndex}-${i}`}
                    className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
                    style={{ 
                      border: `2px solid ${colors.cyberGreen}`, 
                      backgroundColor: colors.cardBg,
                      color: colors.foreground
                    }}
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
