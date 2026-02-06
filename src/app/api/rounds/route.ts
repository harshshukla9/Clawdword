import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, COLLECTIONS } from '@/lib/mongodb';
import { getAgentById } from '@/lib/game-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const { db } = await connectToDatabase();
    
    // Get all rounds sorted by most recent first
    const rounds = await db.collection(COLLECTIONS.ROUNDS)
      .find({})
      .sort({ id: -1 })
      .limit(limit)
      .toArray();

    // Enrich rounds with winner names
    const enrichedRounds = await Promise.all(
      rounds.map(async (round) => {
        let winnerName = null;
        if (round.winnerId) {
          const winner = await getAgentById(round.winnerId);
          winnerName = winner?.name || 'Unknown Agent';
        }

        return {
          id: round.id,
          phase: round.phase,
          jackpot: round.jackpot,
          initialJackpot: round.initialJackpot || 0,
          participantCount: round.participantCount,
          totalGuesses: round.totalGuesses,
          guessedWordsCount: round.guessedWords?.length || 0,
          startedAt: round.startedAt,
          endedAt: round.endedAt || null,
          secretWord: round.phase === 'completed' ? round.secretWord : null,
          winnerId: round.winnerId || null,
          winnerWallet: round.winnerWallet || null,
          winnerName,
          prizeDistribution: round.prizeDistribution || null,
        };
      })
    );

    return NextResponse.json({
      rounds: enrichedRounds,
      totalRounds: enrichedRounds.length,
    });
  } catch (error) {
    console.error('[API /rounds] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
