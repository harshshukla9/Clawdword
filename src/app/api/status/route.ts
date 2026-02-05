import { NextResponse } from 'next/server';
import { 
  getCurrentRound, 
  getLastCompletedRound,
  getLatestRound,
  getTotalRoundsPlayed, 
  getAgentCount,
  getAgentById,
  getWordCount,
} from '@/lib/game-service';
import { GAME_CONSTANTS } from '@/lib/game-types';

export async function GET() {
  try {
    const round = await getCurrentRound();
    const lastCompletedRound = await getLastCompletedRound();
    const latestRound = await getLatestRound();
    const totalRoundsPlayed = await getTotalRoundsPlayed();
    const totalAgentsRegistered = await getAgentCount();
    const wordCount = getWordCount();

    // Get winner info if last completed round has a winner
    let lastCompletedRoundData = null;
    if (lastCompletedRound) {
      let winnerName = null;
      if (lastCompletedRound.winnerId) {
        const winner = await getAgentById(lastCompletedRound.winnerId);
        winnerName = winner?.name || 'Unknown Agent';
      }
      
      lastCompletedRoundData = {
        id: lastCompletedRound.id,
        phase: lastCompletedRound.phase,
        jackpot: lastCompletedRound.jackpot,
        participantCount: lastCompletedRound.participantCount,
        totalGuesses: lastCompletedRound.totalGuesses,
        guessedWordsCount: lastCompletedRound.guessedWords.length,
        startedAt: lastCompletedRound.startedAt,
        endedAt: lastCompletedRound.endedAt,
        secretWord: lastCompletedRound.secretWord,
        winnerId: lastCompletedRound.winnerId || null,
        winnerWallet: lastCompletedRound.winnerWallet || null,
        winnerName,
        prizeDistribution: lastCompletedRound.prizeDistribution || null,
      };
    }

    // Get latest round data (could be active or completed)
    let latestRoundData = null;
    if (latestRound) {
      let winnerName = null;
      if (latestRound.winnerId) {
        const winner = await getAgentById(latestRound.winnerId);
        winnerName = winner?.name || 'Unknown Agent';
      }
      
      latestRoundData = {
        id: latestRound.id,
        phase: latestRound.phase,
        jackpot: latestRound.jackpot,
        initialJackpot: latestRound.initialJackpot,
        participantCount: latestRound.participantCount,
        totalGuesses: latestRound.totalGuesses,
        guessedWordsCount: latestRound.guessedWords.length,
        remainingWordsCount: wordCount - latestRound.guessedWords.length,
        startedAt: latestRound.startedAt,
        endedAt: latestRound.endedAt || null,
        wordHash: latestRound.secretWordHash,
        secretWord: latestRound.phase === 'completed' ? latestRound.secretWord : null,
        winnerId: latestRound.winnerId || null,
        winnerWallet: latestRound.winnerWallet || null,
        winnerName,
        prizeDistribution: latestRound.prizeDistribution || null,
        guessedWords: latestRound.guessedWords || [],
      };
    }

    return NextResponse.json({
      serverTime: Date.now(),
      currentRound: round ? {
        id: round.id,
        phase: round.phase,
        jackpot: round.jackpot,
        initialJackpot: round.initialJackpot,
        participantCount: round.participantCount,
        totalGuesses: round.totalGuesses,
        guessedWordsCount: round.guessedWords.length,
        remainingWordsCount: wordCount - round.guessedWords.length,
        startedAt: round.startedAt,
        wordHash: round.secretWordHash,
        guessedWords: round.guessedWords || [],
      } : null,
      latestRound: latestRoundData,
      lastCompletedRound: lastCompletedRoundData,
      totalRoundsPlayed,
      totalAgentsRegistered,
      gameConstants: {
        wordLength: GAME_CONSTANTS.WORD_LENGTH,
        freeGuesses: GAME_CONSTANTS.FREE_GUESS_COUNT,
        baseGuessCost: GAME_CONSTANTS.BASE_GUESS_COST,
        costMultiplier: GAME_CONSTANTS.COST_MULTIPLIER,
        winnerPercentage: GAME_CONSTANTS.WINNER_PERCENTAGE * 100,
        participantsPercentage: GAME_CONSTANTS.PARTICIPANTS_PERCENTAGE * 100,
        maxParticipantsForReward: GAME_CONSTANTS.MAX_PARTICIPANTS_FOR_REWARD,
        chainId: GAME_CONSTANTS.CHAIN_ID,
        usdcContract: GAME_CONSTANTS.USDC_CONTRACT,
        adminWallet: GAME_CONSTANTS.ADMIN_WALLET,
      },
    });
  } catch (error) {
    console.error('[API /status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
