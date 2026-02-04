"use client";
import { colors } from "@/theme";

const maxAttempts = 5;

export default function GameBoard() {
  // Previous attempts above and below - 3 rows each
  const previousAttemptsAbove = ["BLOCK", "CHAIN", "TOKEN"];
  const previousAttemptsBelow = ["SMART", "PRICE", "TREND"];
  
  // Active game row with "START" word
  const board = [Array.from("START")];

  return (
    <div 
      className="text-white p-4 sm:p-6 flex flex-col items-center justify-center rounded-lg"
      style={{ 
        backgroundColor: colors.background,
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Previous attempts above - 3 rows */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-2 justify-center px-2">
          {previousAttemptsAbove.map((word, rowIndex) =>
            Array.from(word).map((letter, i) => (
              <div
                key={`above-${rowIndex}-${i}`}
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

        {/* Main game board - 1 row (active game row) */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-2 justify-center px-2">
          {board.map((row, rowIndex) =>
            row.map((letter, i) => (
              <div
                key={`${rowIndex}-${i}`}
                className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center"
                style={{ 
                  border: `2px solid ${colors.cardBorder}`, 
                  backgroundColor: colors.cardBg,
                  color: "#10b981"
                }}
              >
                {letter}
              </div>
            ))
          )}
        </div>

        {/* Previous attempts below - 3 rows */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-4 mb-6 sm:mb-8 justify-center px-2">
          {previousAttemptsBelow.map((word, rowIndex) =>
            Array.from(word).map((letter, i) => (
              <div
                key={`below-${rowIndex}-${i}`}
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
      </div>
    </div>
  );
}
