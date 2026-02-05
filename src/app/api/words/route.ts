import { NextResponse } from 'next/server';
import { getCurrentRound, getAvailableWords, getGuessedWords, getWordCount } from '@/lib/game-service';
import { WORD_DICTIONARY } from '@/lib/words';

function buildWordsWithStatus(
  guessedWords: string[],
  dictionary: string[] = WORD_DICTIONARY
): { word: string; status: 'wrong' | 'unguessed' }[] {
  const guessedSet = new Set(guessedWords.map((w) => w.toUpperCase()));
  return dictionary
    .map((word) => ({
      word: word.toUpperCase(),
      status: guessedSet.has(word.toUpperCase()) ? ('wrong' as const) : ('unguessed' as const),
    }))
    .sort((a, b) => a.word.localeCompare(b.word));
}

export async function GET() {
  try {
    const round = await getCurrentRound();

    if (!round) {
      const words = buildWordsWithStatus([]);
      const sortedAvailable = [...WORD_DICTIONARY].sort((a, b) =>
        a.toUpperCase().localeCompare(b.toUpperCase())
      );
      return NextResponse.json({
        roundId: null,
        totalWords: getWordCount(),
        guessedWords: [],
        guessedCount: 0,
        availableWords: sortedAvailable,
        availableCount: sortedAvailable.length,
        words,
        message: 'No active round. Full word list shown. Admin must start a round to play.',
      });
    }

    const availableWords = await getAvailableWords(round.id);
    const guessedWords = await getGuessedWords(round.id);
    const words = buildWordsWithStatus(guessedWords);
    const sortedAvailable = [...availableWords].sort((a, b) =>
      a.toUpperCase().localeCompare(b.toUpperCase())
    );

    return NextResponse.json({
      roundId: round.id,
      totalWords: getWordCount(),
      guessedWords: [...guessedWords].sort((a, b) => a.localeCompare(b)),
      guessedCount: guessedWords.length,
      availableWords: sortedAvailable,
      availableCount: availableWords.length,
      words,
    });
  } catch (error) {
    console.error('[API /words] Error:', error);
    const words = buildWordsWithStatus([]);
    const sortedAvailable = [...WORD_DICTIONARY].sort((a, b) =>
      a.toUpperCase().localeCompare(b.toUpperCase())
    );
    return NextResponse.json({
      roundId: null,
      totalWords: WORD_DICTIONARY.length,
      guessedWords: [],
      guessedCount: 0,
      availableWords: sortedAvailable,
      availableCount: WORD_DICTIONARY.length,
      words,
      message: 'Connected with fallback data. Database may be unavailable.',
    });
  }
}
