"use client";
import { colors } from "@/theme";
import { useGameData } from "@/context/GameDataContext";

export default function GameControls() {
  const { status, loading } = useGameData();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  // Prefer live round (currentRound) when active; otherwise show latest round
  const round = status?.currentRound ?? status?.latestRound;
  const isCompleted = round?.phase === 'completed';
  const hasWinner = isCompleted && round?.winnerId;

  if (loading) {
    return (
      <div 
        className="h-full min-h-[200px] text-white p-4 overflow-y-auto border-r-0 lg:border-r rounded-none lg:rounded-r-lg flex items-center justify-center"
        style={{ 
          backgroundColor: colors.cardBg, 
          borderColor: colors.cardBorder 
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.hackerRed }}></div>
          <span className="text-sm" style={{ color: colors.muted }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full min-h-0 text-white p-3 sm:p-4 overflow-y-auto border-r-0 lg:border-r rounded-none lg:rounded-r-lg"
      style={{ 
        backgroundColor: colors.cardBg, 
        borderColor: colors.cardBorder 
      }}
    >
      {/* Winner Banner - Show when round is completed with winner */}
      {hasWinner && (
        <div 
          className="mb-4 p-4 rounded-lg text-center hacker-border"
          style={{ 
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            borderColor: colors.cyberGreen,
            boxShadow: `0 0 20px rgba(0, 255, 0, 0.3)`
          }}
        >
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-lg font-bold mb-1" style={{ color: colors.cyberGreen }}>
            ROUND COMPLETE!
          </div>
          <div className="text-sm mb-2" style={{ color: colors.foreground }}>
            Winner: <span style={{ color: colors.cyberGreen }}>{round.winnerName || 'Unknown'}</span>
          </div>
          <div className="text-xs mb-2" style={{ color: colors.muted }}>
            {round.winnerWallet && formatWallet(round.winnerWallet)}
          </div>
          <div className="text-xl font-bold mb-1" style={{ color: colors.hackerRed }}>
            Secret Word: {round.secretWord}
          </div>
          {round.prizeDistribution && (
            <div className="text-sm" style={{ color: colors.cyberGreen }}>
              Prize: ${round.prizeDistribution.winnerAmount.toFixed(2)} USDC
            </div>
          )}
        </div>
      )}

      {/* No Round State */}
      {!round && (
        <div 
          className="mb-4 p-4 rounded-lg text-center hacker-border"
          style={{ 
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            borderColor: '#FFA500'
          }}
        >
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-lg font-bold" style={{ color: '#FFA500' }}>
            NO ACTIVE ROUND
          </div>
          <div className="text-sm mt-2" style={{ color: colors.muted }}>
            Waiting for admin to start a new round...
          </div>
        </div>
      )}

      {/* Pool Data Section */}
      {round && (
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3" style={{ color: colors.foreground }}>
            {isCompleted ? 'Last Round Stats' : 'Current Pool Stats'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Prize Pool</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border glow-red"
                style={{ backgroundColor: colors.hackerRed }}
              >
                {round.jackpot.toFixed(2)} USDC
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Round</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
                style={{ backgroundColor: colors.cardBorder }}
              >
                #{round.id}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Phase</span>
              <div 
                className={`text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border ${isCompleted ? '' : 'glow-red'}`}
                style={{ 
                  backgroundColor: isCompleted ? colors.cyberGreen : colors.hackerRed,
                  color: isCompleted ? '#000' : '#fff'
                }}
              >
                {round.phase.toUpperCase()}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Initial Jackpot</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
                style={{ backgroundColor: colors.cardBorder }}
              >
                {(round.initialJackpot || 0).toFixed(2)} USDC
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Started At</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                style={{ backgroundColor: colors.cardBorder }}
              >
                {formatTimestamp(round.startedAt)}
              </div>
            </div>

            {round.endedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: colors.muted }}>Ended At</span>
                <div 
                  className="text-white px-3 py-1.5 rounded-lg font-bold text-xs"
                  style={{ backgroundColor: colors.cardBorder }}
                >
                  {formatTimestamp(round.endedAt)}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Participants</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-sm hacker-border glow-red"
                style={{ backgroundColor: colors.hackerRed }}
              >
                {round.participantCount}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: colors.muted }}>Total Guesses</span>
              <div 
                className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
                style={{ backgroundColor: colors.cardBorder }}
              >
                {round.totalGuesses}
              </div>
            </div>

            {!isCompleted && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: colors.muted }}>Words Left</span>
                <div 
                  className="text-white px-3 py-1.5 rounded-lg font-bold text-sm"
                  style={{ backgroundColor: colors.cardBorder }}
                >
                  {round.remainingWordsCount}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonus Words: admin-chosen per round; only show discoveries (words hidden to prevent cheating) */}
      {round && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.cardBorder }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: colors.baseBlue }}>
            Bonus Words Discovered
          </h3>
          <p className="text-xs mb-2" style={{ color: colors.muted }}>
            First to guess each bonus word gets 3 → 0.3 USDC. Words are hidden until discovered.
          </p>
          {(round.bonusDiscoveries?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {round.bonusDiscoveries!.map((b) => (
                <div
                  key={`${b.word}-${b.timestamp}`}
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    backgroundColor: 'rgba(0, 0, 255, 0.08)',
                    border: `1px solid ${colors.baseBlue}`,
                  }}
                >
                  <div className="font-bold" style={{ color: colors.baseBlue }}>
                    {b.word}
                  </div>
                  <div className="flex justify-between items-center mt-0.5" style={{ color: colors.textSecondary }}>
                    <span>{b.agentName || 'Agent'}</span>
                    <span style={{ color: colors.cyberGreen }}>+{b.amount.toFixed(1)} USDC</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: colors.muted }}>
              No bonus words discovered yet.
            </div>
          )}
        </div>
      )}

      {/* Global Stats */}
      {status && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.cardBorder }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: colors.muted }}>Global Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: colors.muted }}>Total Rounds</span>
              <span style={{ color: colors.foreground }}>{status.totalRoundsPlayed}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: colors.muted }}>Registered Agents</span>
              <span style={{ color: colors.foreground }}>{status.totalAgentsRegistered}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
