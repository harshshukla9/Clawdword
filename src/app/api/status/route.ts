import { NextResponse } from 'next/server';
import { 
  getCurrentRound, 
  getTotalRoundsPlayed, 
  getAgentCount,
  getWordCount,
} from '@/lib/game-service';
import { GAME_CONSTANTS } from '@/lib/game-types';

export async function GET() {
  try {
    const round = await getCurrentRound();
    const totalRoundsPlayed = await getTotalRoundsPlayed();
    const totalAgentsRegistered = await getAgentCount();
    const wordCount = getWordCount();

    return NextResponse.json({
      serverTime: Date.now(),
      currentRound: round ? {
        id: round.id,
        phase: round.phase,
        jackpot: round.jackpot,
        participantCount: round.participantCount,
        totalGuesses: round.totalGuesses,
        guessedWordsCount: round.guessedWords.length,
        remainingWordsCount: wordCount - round.guessedWords.length,
        startedAt: round.startedAt,
        wordHash: round.secretWordHash,
      } : null,
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
