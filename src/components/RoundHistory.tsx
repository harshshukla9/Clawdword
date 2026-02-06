"use client";
import { useState, useEffect } from "react";
import { colors } from "@/theme";

interface RoundData {
  id: number;
  phase: string;
  jackpot: number;
  initialJackpot: number;
  participantCount: number;
  totalGuesses: number;
  guessedWordsCount: number;
  startedAt: number;
  endedAt: number | null;
  secretWord: string | null;
  winnerId: string | null;
  winnerWallet: string | null;
  winnerName: string | null;
  prizeDistribution: {
    winnerAmount: number;
    participantsAmount: number;
    participantsShare: number;
    treasuryAmount: number;
  } | null;
}

interface RoundHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoundHistory({ isOpen, onClose }: RoundHistoryProps) {
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<RoundData | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRounds();
    }
  }, [isOpen]);

  async function fetchRounds() {
    setLoading(true);
    try {
      const response = await fetch('/api/rounds?limit=50');
      if (response.ok) {
        const data = await response.json();
        setRounds(data.rounds || []);
      }
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatDuration = (start: number, end: number | null) => {
    if (!end) return 'Ongoing';
    const duration = end - start;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden hacker-border"
        style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.hackerRed,
          boxShadow: `0 0 30px rgba(255, 0, 64, 0.3)`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.cardBorder, backgroundColor: colors.background }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-bold" style={{ color: colors.foreground }}>
              Round History
            </h2>
            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: colors.cardBorder, color: colors.muted }}>
              {rounds.length} rounds
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition-opacity"
            style={{ color: colors.muted }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[70vh]">
          {/* Rounds List */}
          <div 
            className="w-1/3 border-r overflow-y-auto"
            style={{ borderColor: colors.cardBorder }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.hackerRed }}></div>
                  <span className="text-sm" style={{ color: colors.muted }}>Loading rounds...</span>
                </div>
              </div>
            ) : rounds.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎮</span>
                  <p style={{ color: colors.muted }}>No rounds yet</p>
                </div>
              </div>
            ) : (
              rounds.map((round) => (
                <div
                  key={round.id}
                  className={`p-4 border-b cursor-pointer transition-all hover:opacity-80`}
                  style={{ 
                    borderColor: colors.cardBorder,
                    backgroundColor: selectedRound?.id === round.id ? 'rgba(255, 0, 64, 0.1)' : 'transparent',
                    borderLeft: selectedRound?.id === round.id ? `3px solid ${colors.hackerRed}` : '3px solid transparent'
                  }}
                  onClick={() => setSelectedRound(round)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold" style={{ color: colors.foreground }}>
                      Round #{round.id}
                    </span>
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: round.phase === 'active' ? colors.cyberGreen : round.phase === 'completed' ? colors.hackerRed : colors.cardBorder,
                        color: round.phase === 'active' ? '#000' : '#fff'
                      }}
                    >
                      {round.phase.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: colors.muted }}>
                    <div className="flex justify-between">
                      <span>Jackpot:</span>
                      <span style={{ color: colors.cyberGreen }}>${round.jackpot.toFixed(2)}</span>
                    </div>
                    {round.phase === 'completed' && round.secretWord && (
                      <div className="flex justify-between">
                        <span>Word:</span>
                        <span style={{ color: colors.hackerRed }}>{round.secretWord}</span>
                      </div>
                    )}
                    {round.winnerName && (
                      <div className="flex justify-between">
                        <span>Winner:</span>
                        <span style={{ color: colors.cyberBlue }}>{round.winnerName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Round Details */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedRound ? (
              <div className="space-y-6">
                {/* Round Header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
                    Round #{selectedRound.id}
                  </h3>
                  <span 
                    className="inline-block px-4 py-2 rounded-lg text-sm font-bold"
                    style={{ 
                      backgroundColor: selectedRound.phase === 'completed' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                      color: selectedRound.phase === 'completed' ? colors.cyberGreen : '#FFA500',
                      border: `1px solid ${selectedRound.phase === 'completed' ? colors.cyberGreen : '#FFA500'}`
                    }}
                  >
                    {selectedRound.phase === 'completed' ? '✓ COMPLETED' : '⏳ ' + selectedRound.phase.toUpperCase()}
                  </span>
                </div>

                {/* Secret Word Display */}
                {selectedRound.phase === 'completed' && selectedRound.secretWord && (
                  <div className="text-center">
                    <p className="text-sm mb-2" style={{ color: colors.muted }}>Secret Word</p>
                    <div className="flex justify-center gap-2">
                      {Array.from(selectedRound.secretWord).map((letter, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg"
                          style={{ 
                            backgroundColor: 'rgba(0, 255, 0, 0.2)',
                            border: `2px solid ${colors.cyberGreen}`,
                            color: colors.cyberGreen
                          }}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Winner Info */}
                {selectedRound.winnerId && (
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ 
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    <span className="text-3xl mb-2 block">🏆</span>
                    <p className="text-sm mb-1" style={{ color: colors.muted }}>Winner</p>
                    <p className="text-lg font-bold" style={{ color: '#FFD700' }}>
                      {selectedRound.winnerName || 'Unknown Agent'}
                    </p>
                    {selectedRound.winnerWallet && (
                      <p className="text-xs mt-1" style={{ color: colors.muted }}>
                        {formatWallet(selectedRound.winnerWallet)}
                      </p>
                    )}
                    {selectedRound.prizeDistribution && (
                      <p className="text-lg font-bold mt-2" style={{ color: colors.cyberGreen }}>
                        Won ${selectedRound.prizeDistribution.winnerAmount.toFixed(2)} USDC
                      </p>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="Total Jackpot" value={`$${selectedRound.jackpot.toFixed(2)}`} color={colors.cyberGreen} />
                  <StatBox label="Initial Jackpot" value={`$${selectedRound.initialJackpot.toFixed(2)}`} color={colors.foreground} />
                  <StatBox label="Participants" value={selectedRound.participantCount.toString()} color={colors.cyberBlue} />
                  <StatBox label="Total Guesses" value={selectedRound.totalGuesses.toString()} color={colors.hackerRed} />
                  <StatBox label="Words Guessed" value={selectedRound.guessedWordsCount.toString()} color={colors.foreground} />
                  <StatBox label="Duration" value={formatDuration(selectedRound.startedAt, selectedRound.endedAt)} color={colors.muted} />
                </div>

                {/* Timestamps */}
                <div className="space-y-2 text-sm" style={{ color: colors.muted }}>
                  <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: colors.cardBorder }}>
                    <span>Started:</span>
                    <span style={{ color: colors.foreground }}>{formatTimestamp(selectedRound.startedAt)}</span>
                  </div>
                  {selectedRound.endedAt && (
                    <div className="flex justify-between p-3 rounded-lg" style={{ backgroundColor: colors.cardBorder }}>
                      <span>Ended:</span>
                      <span style={{ color: colors.foreground }}>{formatTimestamp(selectedRound.endedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Prize Distribution */}
                {selectedRound.prizeDistribution && (
                  <div>
                    <h4 className="text-sm font-bold mb-3" style={{ color: colors.muted }}>Prize Distribution</h4>
                    <div className="space-y-2">
                      <PrizeBar 
                        label="Winner (80%)" 
                        amount={selectedRound.prizeDistribution.winnerAmount} 
                        color={colors.cyberGreen}
                        total={selectedRound.jackpot}
                      />
                      <PrizeBar 
                        label="Participants (10%)" 
                        amount={selectedRound.prizeDistribution.participantsAmount} 
                        color={colors.cyberBlue}
                        total={selectedRound.jackpot}
                      />
                      <PrizeBar 
                        label="Treasury (10%)" 
                        amount={selectedRound.prizeDistribution.treasuryAmount} 
                        color={colors.hackerRed}
                        total={selectedRound.jackpot}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-6xl mb-4 block opacity-50">👈</span>
                  <p style={{ color: colors.muted }}>Select a round to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div 
      className="p-4 rounded-lg text-center"
      style={{ backgroundColor: colors.cardBorder }}
    >
      <p className="text-xs mb-1" style={{ color: colors.muted }}>{label}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function PrizeBar({ label, amount, color, total }: { label: string; amount: number; color: string; total: number }) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: colors.muted }}>{label}</span>
        <span style={{ color }}>${amount.toFixed(2)}</span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.cardBg }}
      >
        <div 
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
