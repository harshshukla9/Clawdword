import { NextResponse } from 'next/server';
import { getCurrentRound, getAvailableWords, getGuessedWords, getWordCount } from '@/lib/game-service';
import { WORD_DICTIONARY } from '@/lib/words';

/** Base-branded words to highlight in the middle of the list for Base users */
const FEATURED_WORDS = ['BASED', 'JESSE', 'CLAWD'];

/** Put BASED (and other featured words) in the middle of the list so they attract Base users. */
function putFeaturedInMiddle(words: string[]): string[] {
  const featured = FEATURED_WORDS.filter((w) => words.includes(w));
  if (featured.length === 0) return words;
  const rest = words.filter((w) => !FEATURED_WORDS.includes(w));
  const mid = Math.floor(rest.length / 2);
  return [...rest.slice(0, mid), ...featured, ...rest.slice(mid)];
}

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
      const availableWithFeaturedInMiddle = putFeaturedInMiddle(sortedAvailable);
      return NextResponse.json({
        roundId: null,
        totalWords: getWordCount(),
        guessedWords: [],
        guessedCount: 0,
        availableWords: availableWithFeaturedInMiddle,
        availableCount: availableWithFeaturedInMiddle.length,
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
    const availableWithFeaturedInMiddle = putFeaturedInMiddle(sortedAvailable);

    return NextResponse.json({
      roundId: round.id,
      totalWords: getWordCount(),
      guessedWords: [...guessedWords].sort((a, b) => a.localeCompare(b)),
      guessedCount: guessedWords.length,
      availableWords: availableWithFeaturedInMiddle,
      availableCount: availableWords.length,
      words,
    });
  } catch (error) {
    console.error('[API /words] Error:', error);
    const words = buildWordsWithStatus([]);
    const sortedAvailable = [...WORD_DICTIONARY].sort((a, b) =>
      a.toUpperCase().localeCompare(b.toUpperCase())
    );
    const availableWithFeaturedInMiddle = putFeaturedInMiddle(sortedAvailable);
    return NextResponse.json({
      roundId: null,
      totalWords: WORD_DICTIONARY.length,
      guessedWords: [],
      guessedCount: 0,
      availableWords: availableWithFeaturedInMiddle,
      availableCount: WORD_DICTIONARY.length,
      words,
      message: 'Connected with fallback data. Database may be unavailable.',
    });
  }
}
