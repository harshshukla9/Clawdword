"use client";

import { useRef, useEffect } from "react";
import { colors } from "@/theme";
import { useGameData } from "@/context/GameDataContext";

const FEATURED_WORDS = ['BASED', 'JESSE', 'CLAWD'];

function WordTiles({ word, featured }: { word: string; featured: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-x-1 gap-y-0 justify-center justify-items-center w-max mx-auto">
      {Array.from(word).map((letter, i) => (
        <div
          key={`${word}-${i}`}
          className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
          style={{
            border: `2px solid ${featured ? colors.baseBlue : colors.cyberGreen}`,
            backgroundColor: featured ? 'rgba(0, 0, 255, 0.12)' : colors.cardBg,
            color: featured ? colors.baseBlue : colors.foreground,
            boxShadow: featured ? `0 0 12px ${colors.baseBlue}40` : undefined,
          }}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

export default function GameBoard() {
  const featuredBlockRef = useRef<HTMLDivElement>(null);
  const { status, wordsData, loading } = useGameData();
  const availableWords = wordsData?.availableWords ?? [];
  const guessedWords = wordsData?.guessedWords ?? [];

  const nonFeatured = availableWords.filter((w) => !FEATURED_WORDS.includes(w));
  const mid = Math.floor(nonFeatured.length / 2);
  const topWords = nonFeatured.slice(0, mid);
  const featuredToShow = FEATURED_WORDS.filter((w) => availableWords.includes(w));
  const bottomWords = nonFeatured.slice(mid);

  useEffect(() => {
    if (featuredToShow.length > 0 && featuredBlockRef.current) {
      featuredBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [featuredToShow.length]);

  const isCompleted = status?.latestRound?.phase === "completed";
  const secretWord = status?.latestRound?.secretWord;
  const winnerName = status?.latestRound?.winnerName;
  const hasActiveRound = status?.currentRound !== null;

  return (
    <div 
      className="text-white p-4 sm:p-6 flex flex-col items-center rounded-lg h-full w-full overflow-y-auto scroll-smooth"
      style={{ backgroundColor: colors.background }}
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

        {/* Available words / 5-letter dictionary - show with featured in middle (with or without active round) */}
        {loading ? (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.cyberGreen }}></div>
              <span className="text-sm" style={{ color: colors.muted }}>Loading words...</span>
            </div>
          </div>
        ) : availableWords.length > 0 ? (
          <div className="mt-4">
            <div className="text-center mb-3">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: colors.cardBorder, color: colors.cyberGreen }}>
                {hasActiveRound ? `Available Words (${availableWords.length})` : `5-letter words (${availableWords.length})`}
              </span>
            </div>
            <div className="flex flex-col gap-y-3 sm:gap-y-4 px-2">
              {topWords.map((word, rowIndex) => (
                <WordTiles key={`top-${rowIndex}-${word}`} word={word} featured={false} />
              ))}
              {featuredToShow.length > 0 && (
                <div ref={featuredBlockRef} className="py-4 my-2 rounded-xl px-3" style={{ backgroundColor: 'rgba(0, 0, 255, 0.08)', border: `2px solid ${colors.baseBlue}` }}>
                  <div className="text-center text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.baseBlue }}>
                    On Base? Try these
                  </div>
                  <div className="flex flex-col gap-y-3 sm:gap-y-4 items-center">
                    {featuredToShow.map((word) => (
                      <WordTiles key={`featured-${word}`} word={word} featured />
                    ))}
                  </div>
                </div>
              )}
              {bottomWords.map((word, rowIndex) => (
                <WordTiles key={`bottom-${rowIndex}-${word}`} word={word} featured={false} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
