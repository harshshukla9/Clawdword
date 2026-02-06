import { NextRequest, NextResponse } from 'next/server';
import { 
  getRoundGuesses, 
  getLatestRound,
  getAgentById,
} from '@/lib/game-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundIdParam = searchParams.get('roundId');
    
    let roundId: number;
    
    if (roundIdParam) {
      roundId = parseInt(roundIdParam, 10);
      if (isNaN(roundId)) {
        return NextResponse.json(
          { error: 'Invalid roundId parameter' },
          { status: 400 }
        );
      }
    } else {
      // Get latest round if no roundId specified
      const latestRound = await getLatestRound();
      if (!latestRound) {
        return NextResponse.json({
          roundId: null,
          guesses: [],
          message: 'No rounds found',
        });
      }
      roundId = latestRound.id;
    }

    const guesses = await getRoundGuesses(roundId);
    
    // Enrich guesses with agent names
    const enrichedGuesses = await Promise.all(
      guesses.map(async (guess) => {
        const agent = await getAgentById(guess.agentId);
        return {
          ...guess,
          agentName: agent?.name || 'Unknown Agent',
        };
      })
    );

    return NextResponse.json({
      roundId,
      guesses: enrichedGuesses,
      totalGuesses: enrichedGuesses.length,
    });
  } catch (error) {
    console.error('[API /game/guesses] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
