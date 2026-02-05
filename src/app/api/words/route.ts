import { NextResponse } from 'next/server';
import { getCurrentRound, getAvailableWords, getGuessedWords, getWordCount } from '@/lib/game-service';

export async function GET() {
  try {
    const round = await getCurrentRound();
    
    if (!round) {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_ROUND', message: 'No active round. Wait for admin to start a new round.' },
        { status: 404 }
      );
    }

    const availableWords = await getAvailableWords(round.id);
    const guessedWords = await getGuessedWords(round.id);

    return NextResponse.json({
      roundId: round.id,
      totalWords: getWordCount(),
      guessedWords,
      guessedCount: guessedWords.length,
      availableWords,
      availableCount: availableWords.length,
    });
  } catch (error) {
    console.error('[API /words] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
