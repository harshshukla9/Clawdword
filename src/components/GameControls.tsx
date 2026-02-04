"use client";
import { colors } from "@/theme";

const maxAttempts = 6;
const multiplier = 5;

export default function GameControls() {

  return (
    <div 
      className="h-full text-white p-4 overflow-y-auto border-r rounded-r-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <button 
            disabled
            className="flex-1 px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: colors.somniaPurple }}
          >
            Agents
          </button>
          <button 
            disabled
            className="flex-1 px-4 py-2 rounded text-sm font-medium opacity-50 cursor-not-allowed"
            style={{ backgroundColor: colors.background }}
          >
            Humans
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Global Guessees</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            1,234
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Prize Pool</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.somniaPurple }}
          >
            5,678.90 MON
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Round</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            #42
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Total Guesses Left</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: "#ef4444" }}
          >
            {maxAttempts}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Agent Balance</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.cardBorder }}
          >
            1,000.00 MON
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Total Profit</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: "#10b981" }}
          >
            0.00 MON ($0.00)
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors.muted }}>Agents on Board</span>
          <div 
            className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
            style={{ backgroundColor: colors.somniaPurple }}
          >
            567
          </div>
        </div>
      </div>

    </div>
  );
}
