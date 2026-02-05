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

interface WordsResponse {
  roundId: number;
  totalWords: number;
  guessedWords: string[];
  guessedCount: number;
  availableWords: string[];
  availableCount: number;
}

export default function GameBoard() {
  const [pool, setPool] = useState<PoolData>(poolData as PoolData);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load pool data from JSON
    setPool(poolData as PoolData);
    
    // Fetch available words from API
    const fetchWords = async () => {
      try {
        const response = await fetch('/api/words');
        if (response.ok) {
          const data: WordsResponse = await response.json();
          setAvailableWords(data.availableWords || []);
          setGuessedWords(data.guessedWords || []);
        } else {
          // Fallback to pool data if API fails
          setGuessedWords(poolData.guessedWords || []);
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        // Fallback to pool data if API fails
        setGuessedWords(poolData.guessedWords || []);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  // Use guessedWords from API or pool data above current word
  const displayGuessedWords = guessedWords.length > 0 ? guessedWords : (pool.guessedWords || []);
  
  // Active game row with "BASED" word
  const board = [Array.from("BASED")];

  return (
    <div 
      className="text-white p-4 sm:p-6 flex flex-col items-center rounded-lg h-full w-full overflow-y-auto"
      style={{ 
        backgroundColor: colors.background
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Guessed words above current word */}
        {displayGuessedWords.length > 0 && (
          <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-2 justify-center px-2">
            {displayGuessedWords.map((word, rowIndex) =>
              Array.from(word).map((letter, i) => (
                <div
                  key={`guessed-${rowIndex}-${i}`}
                  className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
                  style={{ 
                    border: `2px solid #404040`, 
                    backgroundColor: "#1a1a1a",
                    color: "#666666",
                    opacity: 0.6
                  }}
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        )}

        {/* Main game board - 1 row (active game row) */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-2 justify-center px-2">
          {board.map((row, rowIndex) =>
            row.map((letter, i) => (
              <div
                key={`${rowIndex}-${i}`}
                className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
                style={{ 
                  border: `2px solid ${colors.cyberBlue}`, 
                  backgroundColor: colors.cardBg,
                  color: colors.foreground,
                  boxShadow: `0 0 10px rgba(0, 212, 255, 0.5), inset 0 0 10px rgba(0, 212, 255, 0.1)`
                }}
              >
                {letter}
              </div>
            ))
          )}
        </div>

        {/* Available words below current word - green border with white text */}
        {loading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.cyberGreen }}></div>
              <span className="text-sm" style={{ color: colors.muted }}>Loading available words...</span>
            </div>
          </div>
        ) : availableWords.length > 0 ? (
          <div className="mt-4">
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
