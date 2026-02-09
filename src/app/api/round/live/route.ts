import { NextResponse } from 'next/server';
import { getCurrentRound } from '@/lib/game-service';
import { getWordCount } from '@/lib/words';

/**
 * GET /api/round/live
 * Returns the current active round only (lightweight for polling).
 * 404 when there is no active round.
 */
export async function GET() {
  try {
    const round = await getCurrentRound();
    const wordCount = getWordCount();

    if (!round || round.phase !== 'active') {
      return NextResponse.json(
        { liveRound: null, hasLiveRound: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasLiveRound: true,
      liveRound: {
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
        bonusDiscoveries: round.bonusDiscoveries || [],
      },
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error('[API /round/live] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
